import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'highlight.js/styles/github.css'
import './app.css'

const container = document.getElementById('root') as HTMLElement
createRoot(container).render(<App />)
