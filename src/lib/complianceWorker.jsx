import nlp from "compromise";

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
        unsatisfiedConditions.push({ section: sectionName, condition });
      }
    });
  }

  if (unsatisfiedConditions.length === 0) {
    self.postMessage("All conditions are satisfied.");
  } else {
    self.postMessage({
      message: "Some conditions are not satisfied.",
      unsatisfiedConditions: unsatisfiedConditions
    });
  }
};
