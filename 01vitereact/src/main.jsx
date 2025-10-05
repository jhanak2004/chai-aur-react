import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'



function MyApp(){
  return (
  <div>
    <h1>laga mafia</h1>
  </div>
  )
}

// const reactElement={
//     type:'g',
//     props:{
//         href:'https://google.com',
//         target:'_blank',
//     },
//     children: 'Click me to go to google'
// }

const anotherElement=(
  <a href="https://google.com" target="_blank">Click me to go to home</a>
)
// const reactElement= React.createElement(

// )
createRoot(document.getElementById('root')).render(
  
    <App />
  
)
