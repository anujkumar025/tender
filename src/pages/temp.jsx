import { useState } from "react";
import { checkProposalComplianceFromPDFs } from "./complianceChecker";

function TenderProposalEvaluator() {
  const [tenderFile, setTenderFile] = useState(null);
  const [proposalFile, setProposalFile] = useState(null);
  const [result, setResult] = useState("");

  const handleEvaluate = async () => {
    if (!tenderFile || !proposalFile) {
      setResult("Please upload both the tender and proposal PDF files.");
      return;
    }

    setResult(""); // Clear previous result

    try {
      const complianceResult = await checkProposalComplianceFromPDFs(
        tenderFile,
        proposalFile
      );
      setResult(complianceResult);
    } catch (error) {
      setResult("An error occurred while processing the PDFs.");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Tender Proposal Evaluator</h2>
      <div>
        <h3>Upload Tender Document</h3>
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => setTenderFile(event.target.files[0])}
        />
      </div>
      <div>
        <h3>Upload Proposal Document</h3>
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => setProposalFile(event.target.files[0])}
        />
      </div>
      <button onClick={handleEvaluate}>Evaluate Proposal</button>
      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Result:</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default TenderProposalEvaluator;