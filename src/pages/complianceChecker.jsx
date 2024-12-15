import * as pdfjsLib from "pdfjs-dist/webpack";

// Worker Script
const workerScript = `
  importScripts('https://unpkg.com/compromise');

  self.onmessage = async function(event) {
    const { tenderText, proposalText } = event.data;

    // Function to extract sections from the tender text
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

    // Function to extract conditions from a section of text
    const extractConditions = (sectionText) => {
      const doc = nlp(sectionText);
      const sentences = doc.sentences().out('array');
      const conditionKeywords = ['must', 'should', 'mandatory', 'required', 'shall', 'need to', 'responsible for'];

      return sentences
        .filter(sentence => conditionKeywords.some(keyword => sentence.toLowerCase().includes(keyword)))
        .map(sentence => sentence.trim().toLowerCase());
    };

    // Function to extract claims from the proposal text
    const extractProposalClaims = (text) => {
      const doc = nlp(text);
      return new Set(doc.sentences().out('array').map(sentence => sentence.trim().toLowerCase()));
    };

    // Extract sections and claims
    const tenderSections = extractSections(tenderText);
    const proposalClaims = extractProposalClaims(proposalText);
    const unsatisfiedConditions = [];

    // Check each section for unmet conditions
    for (const [sectionName, sectionText] of Object.entries(tenderSections)) {
      const conditions = extractConditions(sectionText);
      conditions.forEach(condition => {
        const isSatisfied = Array.from(proposalClaims).some(claim => claim.includes(condition));
        if (!isSatisfied) {
          unsatisfiedConditions.push({Section: sectionName, Condition: condition});
        }
      });
    }

    // Send the result back based on whether conditions are satisfied or not
    if (unsatisfiedConditions.length === 0) {
      self.postMessage("All conditions are satisfied.");
    } else {
      self.postMessage(
        \`Some conditions are not satisfied:

\${unsatisfiedConditions.join("\\n")}\`
      );
    }
  };
`;

// Create Web Worker
const workerBlob = new Blob([workerScript], { type: "application/javascript" });
const worker = new Worker(URL.createObjectURL(workerBlob));

// Helper: Extract text from PDF using pdfjsLib
async function extractTextFromPDF(pdfFile) {
  // Ensure pdfFile is a Blob or URL (if it's a file from an input, read it as an ArrayBuffer)
  const fileUrl = pdfFile instanceof Blob ? URL.createObjectURL(pdfFile) : pdfFile;

  const pdf = await pdfjsLib.getDocument({ url: fileUrl }).promise;
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