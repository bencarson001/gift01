import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Plus, Eye, Download, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const STATUS_BADGES = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  generating: { label: "Generating", className: "bg-blue-100 text-blue-600" },
  preview: { label: "Preview", className: "bg-purple-100 text-purple-600" },
  purchased: { label: "Purchased", className: "bg-green-100 text-green-600" },
  printed: { label: "Printed", className: "bg-amber-100 text-amber-600" },
};

export default function MyLibrary() {
  const navigate = useNavigate();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["my-books"],
    queryFn: () => base44.entities.Book.list("-created_date", 50),
  });

  return (
    <div className="min-h-screen gradient-soft">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="font-serif text-xl font-bold text-gray-900">
            GiftMyBook<span className="text-amber-500">UK</span>
          </Link>
          <Link to={createPageUrl("CreateBook")}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-1" /> New Book
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Library 📚
          </h1>
          <p className="text-gray-500">All your magical creations in one place</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📖</div>
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">No books yet</h3>
            <p className="text-gray-500 mb-6">Create your first magical personalised book!</p>
            <Link to={createPageUrl("CreateBook")}>
              <Button className="bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold rounded-xl px-6 h-12">
                <BookOpen className="w-5 h-5 mr-2" /> Create Your First Book
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-50 hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => navigate(createPageUrl("BookPreview") + `?id=${book.id}`)}
              >
                {/* Cover */}
                <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-amber-50 relative overflow-hidden">
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-purple-200" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className={STATUS_BADGES[book.status]?.className || "bg-gray-100"}>
                      {STATUS_BADGES[book.status]?.label || book.status}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="font-serif text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                    {book.title || "Untitled Book"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    For {book.recipient_name} · {book.total_pages || 20} pages
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {book.created_date ? format(new Date(book.created_date), "d MMM yyyy") : ""}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-purple-600">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}