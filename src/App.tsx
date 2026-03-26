import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ClassificationPage from './pages/ClassificationPage/ClassificationPage'
import KnowledgeBaseEditorPage from './pages/KnowledgeBaseEditorPage/KnowledgeBaseEditorPage'
import './styles/classifier.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClassificationPage />} />
        <Route path="/editor" element={<KnowledgeBaseEditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

