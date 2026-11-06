import React from 'react';
export default function Navbar({logout}) {return <header><div className="container nav"><h1>💸 Expense Tracker</h1><button className="outline" onClick={logout}>Log out</button></div></header>;}
