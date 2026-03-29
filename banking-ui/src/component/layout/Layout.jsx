import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout({children}) {

    return (

        <div style={{display: "flex", height: "100vh"}}>

            <Sidebar/>

            <div style={{flex: 1, display: "flex", flexDirection: "column"}}>

                <Navbar/>

                <div style={{padding: "20px", overflow: "auto", flex: 1}}>
                    {children}
                </div>

            </div>

        </div>

    );

}

export default Layout;