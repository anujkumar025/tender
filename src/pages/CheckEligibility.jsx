import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
//   FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"



function CheckEligibility() {
    const [tenderFiles, setTenderFiles] = useState([]);
    const [files, setFiles] = useState({});
    const form = useForm({
        defaultValues: {
          PANFile: null,
          GSTFile: null,
          PartnershipFile: null,
          POWFile: null,
        },
    });
    
    const onSubmit = (data) => {
        console.log("Form submitted with the following data:", data);
        if(data.PANFile != null && data.GSTFile != null && data.PartnershipFile != null && data.POWFile != null){
            setFiles(data);
        }
    };


    const handleFileChange = (event) => {
        try {
            if (!event.target.files) {
                return;
            }
            const selectedFiles = Array.from(event.target.files);
            setTenderFiles(selectedFiles); // Update Tender files state
            console.log("Tender files:", selectedFiles);
        } catch (error) {
            console.error("Error in handleFileChange:", error);
        }
    };


    return (
        <div className='grid grid-row-10 gap-4 h-full'>
            <header className='row-start-1 mt-0 p-2 grid place-items-center row-span-1 h-12'>
                <div className='text-3xl'>Eliminate Proposals</div>
            </header>
            <div className='grid grid-cols-2 gap-4 place-content-center row-start-2 row-span-8 w-full h-full -translate-y-18'>
                <div>
                    <Label htmlFor="tender-file">Tender</Label>
                    <Input id="tender-file" type="file" onChange={(event) => handleFileChange(event)}/>
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
                <div className='flex gap-3'>
                    <Separator orientation="vertical"/>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-2'>
                            {/* File Input 1 */}
                            <FormField
                            control={form.control}
                            name="PANFile"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>PAN Card</FormLabel>
                                <FormControl>
                                    <Input type="file" onChange={(e) => field.onChange(e.target.files[0])} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            {/* File Input 2 */}
                            <FormField
                            control={form.control}
                            name="GSTFile"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>GST Registration Certificate</FormLabel>
                                <FormControl>
                                    <Input type="file" onChange={(e) => field.onChange(e.target.files[0])} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            {/* File Input 3 */}
                            <FormField
                            control={form.control}
                            name="PartnershipFile"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Partnership Deed (if applicable)</FormLabel>
                                <FormControl>
                                    <Input type="file" onChange={(e) => field.onChange(e.target.files[0])} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            {/* File Input 4 */}
                            <FormField
                            control={form.control}
                            name="POWFile"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Power of Attorney (if applicable)</FormLabel>
                                <FormControl>
                                    <Input type="file" onChange={(e) => field.onChange(e.target.files[0])} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            {/* Submit Button */}
                            <Button type="submit">Submit</Button>
                        </form>
                        </Form>
                </div>
            </div>
        </div>
    )
}

export default CheckEligibility