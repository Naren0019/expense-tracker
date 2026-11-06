import React, { useEffect, useState } from 'react';
import api from '../api.js';
import Navbar from '../components/Navbar.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionList from '../components/TransactionList.jsx';
import ExpenseChart from '../components/ExpenseChart.jsx';
const money = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(Number(value||0));
export default function Dashboard({logout}) {
 const [items,setItems]=useState([]); const [summary,setSummary]=useState({income:'0',expense:'0',balance:'0',categories:[]});const [error,setError]=useState('');
 async function refresh(){const [t,s]=await Promise.all([api.get('/transactions'),api.get('/summary')]);setItems(t.data);setSummary(s.data);}
 useEffect(()=>{refresh().catch(err=>{if(err.response?.status===401)logout();else setError('Cannot load data. Check that Flask and MongoDB are running.');});},[]);
 async function add(form){await api.post('/transactions',form);await refresh();}
 async function remove(id){if(!window.confirm('Delete this transaction?'))return;try{await api.delete(`/transactions/${id}`);await refresh();}catch{setError('Unable to delete transaction.');}}
 return <><Navbar logout={logout}/><main className="container dashboard"><h2>Financial overview</h2>{error&&<p className="error" role="alert">{error}</p>}<div className="stats"><article className="stat"><span>Total income</span><strong className="income">{money(summary.income)}</strong></article><article className="stat"><span>Total expenses</span><strong className="expense">{money(summary.expense)}</strong></article><article className="stat"><span>Balance</span><strong>{money(summary.balance)}</strong></article></div><div className="two-col"><TransactionForm onAdd={add}/><ExpenseChart categories={summary.categories}/></div><TransactionList items={items} onDelete={remove}/></main></>;
}
