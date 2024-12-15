// import React from 'react'
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom";

function Home() {
    // const navigate = useNavigate();
    return (
        <div className="grid place-items-center h-full">
            <div className="grid place-items-cetner gap-4">
                <Link to="/checkeligibility" className="w-full">
                    <Button className="w-full">Check Eligibility</Button>
                </Link>
                <Link to="/selectbest" className="w-full">
                    <Button className="w-full">Select Best</Button>
                </Link>
            </div>
        </div>
    )
}

export default Home