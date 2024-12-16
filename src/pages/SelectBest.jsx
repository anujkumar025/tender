import { useState, useEffect} from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { checkProposalComplianceFromPDFs } from './complianceChecker'
import { Button } from '@/components/ui/button'


function SelectBest() {
    const [tenderFiles, setTenderFiles] = useState([]);
    const [proposalFiles, setProposalFiles] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [gotOutput, setGotOutput] = useState(false)
    // const [good, setGood] = useState([]);
    // const [result, setResult] = useState([]);

    useEffect(() => {
        console.log(tenderFiles)
        console.log(proposalFiles)
    }, [tenderFiles, proposalFiles])
    
    useEffect(() => {
        console.log("gotOutput123")
        console.log(gotOutput)
    }, [gotOutput])

    const handleFileChange = (event, inputType) => {
        try {
            if (!event.target.files) {
                // console.error("No files selected");
                return;
            }
            const selectedFiles = Array.from(event.target.files);
            // setSubmitted(false)

            if (inputType === 1) {
                setTenderFiles(selectedFiles); // Update Tender files state
                console.log("Tender files:", selectedFiles);
            } else if (inputType === 2) {
                let tpr = []
                for(let i=0;i<selectedFiles.length;i++){
                    tpr.push({status:true,
                            wfile: selectedFiles[i],
                            message:[]
                    })
                }
            setProposalFiles(tpr); // Update Proposal files state
            console.log("Proposal files:", tpr);
        }
        } catch (error) {
        console.error("Error in handleFileChange:", error);
        }
    };

    const handleFileDelete = (indexToDelete) => {
        setProposalFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToDelete));
    };

    async function handleSubmit() {
        setSubmitted(true)
        try {
            for (let i = 0; i < proposalFiles.length; i++) {
              setGotOutput(true)
            console.log(i);
      
            const complianceResult = await checkProposalComplianceFromPDFs(
              tenderFiles[0],
              proposalFiles[i].wfile
            );
      
            setProposalFiles((prevProposalFiles) => {
              const updatedProposalFiles = [...prevProposalFiles];
      
              updatedProposalFiles[i] = {
                ...updatedProposalFiles[i],
                status: false,
                message: complianceResult.message,
              };
      
              return updatedProposalFiles;
            });
          }
        
        } catch (error) {
          console.error("Error checking compliance:", error);
        }
      }
      


    return (
        <div className='flex flex-col gap-4 h-full'>
            <header className='row-start-1 mt-0 p-2 grid place-items-center row-span-1 h-12'>
                <div className='text-3xl'>Procure Sense</div>
            </header>
            <div className='grid grid-cols-2 gap-4 place-content-center row-start-2 row-span-8 w-full h-full -translate-y-18'>
                <div>
                    <Label htmlFor="tender-file">Tender</Label>
                    <Input id="tender-file" type="file" onChange={(event) => handleFileChange(event, 1)}/>
                    {tenderFiles.length > 0 && (
                        <ScrollArea className="size-auto w-48 rounded-md border mt-2">
                        <div className="p-4">
                            <h4 className="mb-4 text-sm font-medium leading-none">Uploaded Tender</h4>
                            {tenderFiles.map((p_file, index) => (
                            <div key={index}>
                                <div className="text-sm">{p_file.name}</div>
                            </div>
                            ))}
                        </div>
                        </ScrollArea>
                    )}
                </div>
                <div className='grid gap-2'>
                    <Label htmlFor="tender-file">Proposals</Label>
                    <Input id="tender-file" type="file" multiple onChange={(event) => handleFileChange(event, 2)}/>
                    {proposalFiles.length > 0 && (
                        <ScrollArea className="h-33 w-48 rounded-md border mt-2">
                            <div className="p-4">
                                <h4 className="mb-4 text-sm font-medium leading-none">Uploaded Proposals</h4>
                                {proposalFiles.map((p_file, index) => (
                                <div key={index}>
                                    {index > 0 && <Separator className="my-2" />}
                                    <div className='flex justify-between'>
                                        <div className="text-sm">{p_file.wfile.name}</div>
                                        <button className="tooltip flex flex-col justify-center items-center p-2 border-0 bg-[rgba(100,77,237,0.08)] rounded-[1.25em] transition-all duration-200 hover:shadow-lg" onClick={() => handleFileDelete(index)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" height="15" width="15">
                                                <path fill="#6361D9" d="M8.78842 5.03866C8.86656 4.96052 8.97254 4.91663 9.08305 4.91663H11.4164C11.5269 4.91663 11.6329 4.96052 11.711 5.03866C11.7892 5.11681 11.833 5.22279 11.833 5.33329V5.74939H8.66638V5.33329C8.66638 5.22279 8.71028 5.11681 8.78842 5.03866ZM7.16638 5.74939V5.33329C7.16638 4.82496 7.36832 4.33745 7.72776 3.978C8.08721 3.61856 8.57472 3.41663 9.08305 3.41663H11.4164C11.9247 3.41663 12.4122 3.61856 12.7717 3.978C13.1311 4.33745 13.333 4.82496 13.333 5.33329V5.74939H15.5C15.9142 5.74939 16.25 6.08518 16.25 6.49939C16.25 6.9136 15.9142 7.24939 15.5 7.24939H15.0105L14.2492 14.7095C14.2382 15.2023 14.0377 15.6726 13.6883 16.0219C13.3289 16.3814 12.8414 16.5833 12.333 16.5833H8.16638C7.65805 16.5833 7.17054 16.3814 6.81109 16.0219C6.46176 15.6726 6.2612 15.2023 6.25019 14.7095L5.48896 7.24939H5C4.58579 7.24939 4.25 6.9136 4.25 6.49939C4.25 6.08518 4.58579 5.74939 5 5.74939H6.16667H7.16638ZM7.91638 7.24996H12.583H13.5026L12.7536 14.5905C12.751 14.6158 12.7497 14.6412 12.7497 14.6666C12.7497 14.7771 12.7058 14.8831 12.6277 14.9613C12.5495 15.0394 12.4436 15.0833 12.333 15.0833H8.16638C8.05588 15.0833 7.94989 15.0394 7.87175 14.9613C7.79361 14.8831 7.74972 14.7771 7.74972 14.6666C7.74972 14.6412 7.74842 14.6158 7.74584 14.5905L6.99681 7.24996H7.91638Z" clip-rule="evenodd" fill-rule="evenodd"></path>
                                            </svg>
                                            <span className="tooltiptext invisible w-16 bg-[rgba(0,0,0,0.253)] text-white text-center rounded-lg py-1 absolute z-10 top-[25%] left-[110%] after:content-[''] after:absolute after:top-1/2 after:right-full after:translate-y-[-50%] after:border-[5px] after:border-transparent after:border-r-[rgba(0,0,0,0.253)]">
                                            remove
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                    {!submitted && <Button className="w-4/6" onClick={handleSubmit}>Submit</Button>}
                </div>
            </div>
            {submitted && gotOutput && (<div className="flex gap-6">
                <div className="w-1/2 bg-green-100 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-4">Eligible Proposals</h3>
                    {proposalFiles
                    .filter((file) => file.status === true)
                    .map((file, index) => (
                        <div key={index} className="mb-4 border-b border-green-300 pb-2">
                        <p><span className="font-medium">File:</span> {file.wfile.name}</p>
                        </div>
                    ))}
                </div>

                <div className="w-1/2 bg-red-100 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-4">All criteria are not satisfied</h3>
                    {proposalFiles
                    .filter((file) => file.status === false)
                    .map((file, index) => (
                        <div key={index} className="mb-4 border-b border-red-300 pb-2">
                        <p><span className="font-medium">File:</span> {file.wfile.name}</p>
                        <p className="mt-2 font-medium">Unsatisfied Conditions:</p>
                        <ul className="list-disc list-inside ml-4">
                            {file.message.map((msg, msgIndex) => (
                            <li key={msgIndex} className="text-sm text-red-700">{msg}</li>
                            ))}
                        </ul>
                        </div>
                    ))}
                </div>
            </div>)}
        </div>
    )
}

export default SelectBest