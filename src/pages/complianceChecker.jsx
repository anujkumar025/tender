import * as pdfjsLib from "pdfjs-dist/webpack";

// Worker Script
const workerScript = `
  importScripts('https://unpkg.com/compromise');

  self.onmessage = async function(event) {
    const { tenderText, proposalText } = event.data;
    //console.log("Raw Tender Text:", tenderText);

    // conditions
    const hConditions = [
      "the whole of the work shall be executed in conformity with the indian railways standard general condition of contract",
      "the rates should be inclusive of materials, equipment, vehicle, traveling, boarding, incidental and transportation",
      "the railway shall not be responsible for any loss or damage to the contractor's men, materials, equipment, and plants",
      "no interest will be payable on security deposit, bid security & performance guarantee",
      "jvs/consortiums/mous will not be considered"
    ];

    // Function to extract sections from the tender text
    const extractSections = (text) => {
      const sections = {};
      
      // Define headings as they appear in the tender text
      const headings = [
        'Special Financial Criteria',
        'Special Technical Criteria',
        'General Instructions',
        'Special Conditions',
        'Compliance',
        'Undertakings'
      ];

      // Improved regex to handle spaces and newlines
      headings.forEach(function(heading, index) {
        const nextHeading = headings[index + 1] || '$'; // Next heading or end of text
        const regex = new RegExp(heading + "\\s*([\\s\\S]*?)(?=" + nextHeading + "|$)", "i"); // Match content until the next heading
        const match = text.match(regex);

        if (match) {
          sections[heading.toLowerCase()] = match[1].trim(); // Add matched section content
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
    //console.log("Tender Sections Extracted:", JSON.stringify(tenderSections, null, 2));

    const proposalClaims = extractProposalClaims(proposalText);
    //console.log("Proposal Claims Extracted:", Array.from(proposalClaims));

    const unsatisfiedConditions = [];

    // Check each section for unmet conditions
    for (const [sectionName, sectionText] of Object.entries(tenderSections)) {
      const conditions = extractConditions(sectionText);
      //console.log('Conditions extracted from section "' + sectionName + '": ' + JSON.stringify(conditions));

      // Check extracted conditions from the tender
      conditions.forEach(function(condition) {
        const isSatisfied = Array.from(proposalClaims).some(function(claim) {
          const conditionWords = new Set(condition.split(/\s+/).map(function(word) {
            return word.toLowerCase();
          }));
          const claimWords = new Set(claim.split(/\s+/).map(function(word) {
            return word.toLowerCase();
          }));
          const matchedWords = Array.from(conditionWords).filter(function(word) {
            return claimWords.has(word);
          });
          return matchedWords.length / conditionWords.size > 0.8;
        });

        if (!isSatisfied) {
          unsatisfiedConditions.push({ Section: sectionName, Condition: condition });
        }
      });
    }

    // Check conditions
    //console.log("Checking conditions against the proposal...");
hConditions.forEach(function (condition) {
  const isSatisfied = Array.from(proposalClaims).some(function (claim) {
    // Use word-level matching and calculate similarity
    const conditionWords = new Set(condition.split(/\s+/).map(word => word.toLowerCase()));
    const claimWords = new Set(claim.split(/\s+/).map(word => word.toLowerCase()));

    // Compute the ratio of matched words
    const matchedWords = Array.from(conditionWords).filter(word => claimWords.has(word));
    const similarity = matchedWords.length / conditionWords.size;

    // Match if similarity is above 0.75
    return similarity > 0.0;
  });

      if (!isSatisfied) {
        //console.log("\All Condition NOT satisfied: \${condition}"\);
        unsatisfiedConditions.push(condition);
      } else {
        //console.log("\All Condition satisfied: \${condition}"\);
      }
    });

    // Final output
    if (unsatisfiedConditions.length === 0) {
      //console.log("Unsatisfied Conditions: None. All conditions are satisfied.");
      self.postMessage({status: true, message:[]});
    } else {
      //console.log("Unsatisfied Conditions:", JSON.stringify(unsatisfiedConditions, null, 2));
      self.postMessage(
        {status: false, message: unsatisfiedConditions}
        );
    }
  };
  `;
        // \`Some conditions are not satisfied:\\n\\n\${unsatisfiedConditions.map(function(c) {
        //   return "Section: " + c.Section + ", Condition: " + c.Condition;
        // }).join("\\n")}\`

// Create Web Worker
const workerBlob = new Blob([workerScript], { type: "application/javascript" });
const worker = new Worker(URL.createObjectURL(workerBlob));

// Helper: Extract text from PDF using pdfjsLib
async function extractTextFromPDF(pdfFile) {
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