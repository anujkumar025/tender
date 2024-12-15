import * as pdfjsLib from "pdfjs-dist/webpack";

const workerScript = `
  importScripts('https://unpkg.com/compromise');

  self.onmessage = async function(event) {
    const { tenderText, proposalText } = event.data;

    const extractSections = (text) => {
      const doc = nlp(text);
      const sections = {};
      const headings = [
        'special eligibility criteria',
        'commercial compliance',
        'undertakings',
        'compliance conditions',
        'delivery period',
        'payment terms',
        'inspection agency',
        'special conditions',
        'local content'
      ];

      headings.forEach((heading) => {
        const section = doc.match(heading + '[.!\\s\\S]+?(?=[A-Z]{2,}|\\n\\n|$)').out('text');
        if (section) {
          sections[heading.toLowerCase()] = section;
        }
      });

      return sections;
    };

    const extractConditions = (sectionText) => {
      const doc = nlp(sectionText);
      const sentences = doc.sentences().out('array');
      const conditionKeywords = ['must', 'should', 'mandatory', 'required', 'shall', 'need to', 'responsible for'];

      return sentences
        .filter(sentence => conditionKeywords.some(keyword => sentence.toLowerCase().includes(keyword)))
        .map(sentence => sentence.trim().toLowerCase());
    };

    const extractProposalClaims = (text) => {
      const doc = nlp(text);
      return new Set(doc.sentences().out('array').map(sentence => sentence.trim().toLowerCase()));
    };

    const tenderSections = extractSections(tenderText);
    const proposalClaims = extractProposalClaims(proposalText);
    const unsatisfiedConditions = [];

    for (const [sectionName, sectionText] of Object.entries(tenderSections)) {
      const conditions = extractConditions(sectionText);
      conditions.forEach(condition => {
        const isSatisfied = Array.from(proposalClaims).some(claim => claim.includes(condition));
        if (!isSatisfied) {
          unsatisfiedConditions.push(Section: ${sectionName}, Condition: "${condition}");
        }
      });
    }

    if (unsatisfiedConditions.length === 0) {
      self.postMessage("All conditions are satisfied.");
    } else {
      self.postMessage(
        "Some conditions are not satisfied:\n\n" +
        unsatisfiedConditions.join("\n")
      );
    }
  };
`;

// Create Web Worker
const workerBlob = new Blob([workerScript], { type: "application/javascript" });
const worker = new Worker(URL.createObjectURL(workerBlob));

// Helper: Extract text from PDF using pdfjsLib
async function extractTextFromPDF(pdfFile) {
  const pdf = await pdfjsLib.getDocument(pdfFile).promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    text += pageText + "\n";
  }

  return text.trim();
}

// Main Function: Check Compliance
export async function checkProposalComplianceFromPDFs(tenderFile, proposalFile) {
  const tenderText = await extractTextFromPDF(tenderFile);
  const proposalText = await extractTextFromPDF(proposalFile);

  return new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      const result = event.data;
      resolve(result); // Return the result directly as a readable string
      worker.terminate();
    };

    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };

    worker.postMessage({ tenderText, proposalText });
  });
}