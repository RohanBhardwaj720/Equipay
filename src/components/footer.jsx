import React from "react";

function Footer(){
    const today = new Date();
    const year = today.getFullYear();
    return (
        <footer>
            <p>Copyright ⓒ {year}</p>
        </footer>
    );
}

export default Footer;