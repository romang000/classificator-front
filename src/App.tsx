import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ClassificationPage from './pages/ClassificationPage/ClassificationPage'
import KnowledgeBaseEditorPage from './pages/KnowledgeBaseEditorPage/KnowledgeBaseEditorPage'
import './styles/classifier.css'
import { CheckKnowledgeBase } from './pages/CheckKnowledgeBase.tsx/CheckKnowledgeBase'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClassificationPage />} />
        <Route path="/editor" element={<KnowledgeBaseEditorPage />} />
        <Route path="/view" element={<CheckKnowledgeBase />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
