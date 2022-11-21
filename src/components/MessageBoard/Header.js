import React, { useState } from 'react';
const Header = ({message, endHeader}) => {

    return(
        <div>
            <div>message</div>
            <button onClick={endHeader}>Next</button>
        </div>
    )
}

export default Header;