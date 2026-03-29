import {Link} from "react-router-dom";

function Sidebar() {

    return (

        <div
            style={{
                width: "250px",
                background: "#1e2a38",
                color: "white",
                padding: "20px"
            }}
        >

            <h3>Core Banking</h3>

            <hr/>

            <ul style={{listStyle: "none", padding: "0"}}>

                <li>
                    <Link to="/dashboard" style={{color: "white", textDecoration: "none"}}>
                        Dashboard
                    </Link>
                </li>

                <li>
                    <Link to="/customers" style={{color: "white", textDecoration: "none"}}>
                        Customers
                    </Link>
                </li>

                <li>
                    <Link to="/pending-approvals" style={{color: "white", textDecoration: "none"}}>
                        Pending Approvals
                    </Link>
                </li>

            </ul>

        </div>

    );

}

export default Sidebar;