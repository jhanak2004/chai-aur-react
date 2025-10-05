import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  let [counter, setCounter] = useState(15);

 const addValue=()=> {
  setCounter(prevCounter => prevCounter + 1)
  setCounter(prevCounter => prevCounter + 1)
  setCounter(prevCounter => prevCounter + 1)
setCounter(prevCounter => prevCounter + 1)
    
 }

  const removeValue=()=> {
  setCounter(counter - 1)
 }
  return (
   <>
   <h1>Chai mafia</h1>
   <h2>Counter value: {counter}</h2>
    <button onClick={addValue}>Increment{counter}</button>
    <br />
    <button onClick={removeValue}>Decrement{counter}</button>
    <p>footer: {counter}</p>
   </>
  )
}

export default App
