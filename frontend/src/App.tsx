import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import HomePage from "@/pages/Index";
import CompaniesPage from "@/pages/Companies";
import CompanyDetailPage from "@/pages/CompanyDetail";
import QuestionDetailPage from "@/pages/QuestionDetail";
import ProblemDetailPage from "@/pages/ProblemDetail";
import BookmarksPage from "@/pages/Bookmarks";
import LoginPage from "@/pages/Login";
import ProfilePage from "@/pages/Profile";
import AdminUsersPage from "@/pages/AdminUsers";
import ProblemsPage from "@/pages/Problems";
import CategoryDetailPage from "@/pages/CategoryDetail";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/company/:slug" element={<CompanyDetailPage />} />
            <Route path="/company/:slug/question/:questionId" element={<QuestionDetailPage />} />
            <Route path="/company/:slug/problem/:problemSlug" element={<ProblemDetailPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/category/:categorySlug" element={<CategoryDetailPage />} />
            <Route path="/problems/category/:categorySlug/:problemSlug" element={<ProblemDetailPage />} />
            <Route path="/problem/:slug" element={<ProblemDetailPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;