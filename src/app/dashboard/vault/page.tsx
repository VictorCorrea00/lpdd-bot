"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Star,
  RefreshCw,
  Link2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function VaultPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    type: "link",
    category: "",
    title: "",
    content: "",
    is_favorite: false
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vault');
      const data = await res.json();
      if (res.ok) {
        setItems(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch vault items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async () => {
    const method = formData.id ? "PUT" : "POST";
    const body = { ...formData };
    
    try {
      const res = await fetch('/api/vault', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setIsDialogOpen(false);
        fetchItems();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este elemento?")) return;
    
    try {
      const res = await fetch('/api/vault', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const toggleFavorite = async (item: any) => {
    try {
      const res = await fetch('/api/vault', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, is_favorite: !item.is_favorite })
      });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      type: "link",
      category: "",
      title: "",
      content: "",
      is_favorite: false
    });
  };

  const openEdit = (item: any) => {
    setFormData(item);
    setIsDialogOpen(true);
  };

  const filteredItems = items.filter(item => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch = 
      (item.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.content?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.category?.toLowerCase() || "").includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Bóveda de Contenido</h1>
          <p className="text-zinc-400 text-sm">Gestiona enlaces, textos y comandos guardados.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchItems} className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{formData.id ? 'Editar Elemento' : 'Nuevo Elemento'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Tipo</label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <SelectItem value="link">Enlace</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Categoría</label>
                  <Input 
                    placeholder="Ej. Herramientas, Noticias..." 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Título</label>
                  <Input 
                    placeholder="Título descriptivo" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Contenido (URL o Texto)</label>
                  <Textarea 
                    placeholder="Contenido..." 
                    value={formData.content} 
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="bg-zinc-900 border-zinc-800 min-h-[100px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-700 bg-transparent text-zinc-300">
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Buscar en la bóveda..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant={filterType === "all" ? "secondary" : "outline"}
            onClick={() => setFilterType("all")}
            className={filterType === "all" ? "bg-zinc-800 text-zinc-100" : "border-zinc-800 text-zinc-400"}
          >
            Todos
          </Button>
          <Button 
            variant={filterType === "link" ? "secondary" : "outline"}
            onClick={() => setFilterType("link")}
            className={filterType === "link" ? "bg-zinc-800 text-cyan-400" : "border-zinc-800 text-zinc-400"}
          >
            Enlaces
          </Button>
          <Button 
            variant={filterType === "text" ? "secondary" : "outline"}
            onClick={() => setFilterType("text")}
            className={filterType === "text" ? "bg-zinc-800 text-emerald-400" : "border-zinc-800 text-zinc-400"}
          >
            Textos
          </Button>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="w-12 text-zinc-400"></TableHead>
              <TableHead className="text-zinc-400">Tipo</TableHead>
              <TableHead className="text-zinc-400">Categoría</TableHead>
              <TableHead className="text-zinc-400">Título / Contenido</TableHead>
              <TableHead className="text-zinc-400 text-center">Clicks</TableHead>
              <TableHead className="text-zinc-400">Fecha</TableHead>
              <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">Cargando datos...</TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">No se encontraron elementos.</TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="border-zinc-800/50 hover:bg-zinc-800/50">
                  <TableCell>
                    <button onClick={() => toggleFavorite(item)} className="text-zinc-500 hover:text-amber-400 transition-colors">
                      <Star className={`w-4 h-4 ${item.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </TableCell>
                  <TableCell>
                    {item.type === 'link' ? (
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
                        <Link2 className="w-3 h-3 mr-1" /> Link
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                        <FileText className="w-3 h-3 mr-1" /> Text
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                      {item.category || 'Sin categoría'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-medium text-zinc-200 truncate">{item.title || 'Sin título'}</div>
                    <div className="text-xs text-zinc-500 truncate">{item.content}</div>
                  </TableCell>
                  <TableCell className="text-center text-zinc-400">{item.click_count || 0}</TableCell>
                  <TableCell className="text-sm text-zinc-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-zinc-400 hover:text-red-400 hover:bg-zinc-800">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
