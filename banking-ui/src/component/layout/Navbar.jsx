function Navbar() {

    const username = localStorage.getItem("username");

    return (

        <div
            style={{
                height: "60px",
                background: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px"
            }}
        >

            <h4>Dashboard</h4>

            <div>
                Welcome {username}
            </div>

        </div>

    );

}

export default Navbar;