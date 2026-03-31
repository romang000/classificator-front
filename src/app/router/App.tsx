import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../features/auth/ui/LoginPage'
import ClassificationPage from '../../features/classification/ui/ClassificationPage'
import KnowledgeBaseEditorPage from '../../features/knowledge-base/ui/KnowledgeBaseEditorPage'
import '../styles/classifier.css'
import { CheckKnowledgeBase } from '../../features/knowledge-base/ui/CheckKnowledgeBase'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ClassificationPage />} />
        <Route path="/editor" element={<KnowledgeBaseEditorPage />} />
        <Route path="/view" element={<CheckKnowledgeBase />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
