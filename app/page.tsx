"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Dumbbell,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  Clock,
  Save,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react"

interface Section {
  id: string
  name: string
  type: "task" | "exercise"
  imageUrls: string[]
  createdAt: string
}

interface Week {
  id: string
  name: string
  sections: Section[]
  createdAt: string
}

interface Record {
  id: string
  name: string
  weeks: Week[]
  createdAt: string
}

interface AppData {
  records: Record[]
  studentName: string
  teacherName: string
  studentImage: string
  teacherImage: string
}

const DEFAULT_IMAGE = "/educational-content.png"

export default function EducationalSystem() {
  const [data, setData] = useState<AppData>({
    records: [],
    studentName: "Juan Luis Hernández Hercules - CIF: 2022010431",
    teacherName: "Claudia Carolina Amaya de Serrano",
    studentImage: "/foto1.jpg",
    teacherImage: "/foto2.jpg",
  })
  const [isEditMode, setIsEditMode] = useState(true)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingSectionName, setEditingSectionName] = useState("")
  const [editingSectionImages, setEditingSectionImages] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState("")

  const [isCreatingSection, setIsCreatingSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState("")
  const [newSectionType, setNewSectionType] = useState<"task" | "exercise">("task")
  const [newSectionRecordId, setNewSectionRecordId] = useState("")
  const [newSectionWeekId, setNewSectionWeekId] = useState("")
  const [newSectionImages, setNewSectionImages] = useState<string[]>([])
  const [newSectionImageUrl, setNewSectionImageUrl] = useState("")

  const [zoomLevel, setZoomLevel] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const createWeek = (recordId: string) => {
    setData((prev) => ({
      ...prev,
      records: prev.records.map((record) =>
        record.id === recordId
          ? {
              ...record,
              weeks: [
                ...record.weeks,
                {
                  id: Date.now().toString(),
                  name: `Semana ${record.weeks.length + 1}`,
                  sections: [],
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : record,
      ),
    }))
  }

  const createRecord = () => {
    const newRecord: Record = {
      id: Date.now().toString(),
      name: `Registro ${data.records.length + 1}`,
      weeks: [],
      createdAt: new Date().toISOString(),
    }

    setData((prev) => ({
      ...prev,
      records: [...prev.records, newRecord],
    }))
  }

  useEffect(() => {
    const savedData = localStorage.getItem("educational-system-data")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setData(parsedData)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("educational-system-data", JSON.stringify(data))
  }, [data])

  const createSection = (recordId: string, weekId: string, type: "task" | "exercise") => {
    setNewSectionRecordId(recordId)
    setNewSectionWeekId(weekId)
    setNewSectionType(type)
    setNewSectionName("")
    setNewSectionImages([])
    setNewSectionImageUrl("")
    setIsCreatingSection(true)
  }

  const saveNewSection = () => {
    if (!newSectionName.trim()) return

    const newSection: Section = {
      id: Date.now().toString(),
      name: newSectionName.trim(),
      type: newSectionType,
      imageUrls: newSectionImages,
      createdAt: new Date().toISOString(),
    }

    setData((prev) => ({
      ...prev,
      records: prev.records.map((record) =>
        record.id === newSectionRecordId
          ? {
              ...record,
              weeks: record.weeks.map((week) =>
                week.id === newSectionWeekId ? { ...week, sections: [...week.sections, newSection] } : week,
              ),
            }
          : record,
      ),
    }))

    setIsCreatingSection(false)
  }

  const cancelNewSection = () => {
    setIsCreatingSection(false)
    setNewSectionName("")
    setNewSectionImages([])
    setNewSectionImageUrl("")
  }

  const addImageToNewSection = () => {
    if (newSectionImageUrl.trim()) {
      setNewSectionImages([...newSectionImages, newSectionImageUrl.trim()])
      setNewSectionImageUrl("")
    }
  }

  const removeImageFromNewSection = (index: number) => {
    setNewSectionImages(newSectionImages.filter((_, i) => i !== index))
  }

  const deleteRecord = (recordId: string) => {
    setData((prev) => ({
      ...prev,
      records: prev.records.filter((record) => record.id !== recordId),
    }))
  }

  const deleteWeek = (recordId: string, weekId: string) => {
    setData((prev) => ({
      ...prev,
      records: prev.records.map((record) =>
        record.id === recordId ? { ...record, weeks: record.weeks.filter((week) => week.id !== weekId) } : record,
      ),
    }))
  }

  const deleteSection = (recordId: string, weekId: string, sectionId: string) => {
    setData((prev) => ({
      ...prev,
      records: prev.records.map((record) =>
        record.id === recordId
          ? {
              ...record,
              weeks: record.weeks.map((week) =>
                week.id === weekId
                  ? { ...week, sections: week.sections.filter((section) => section.id !== sectionId) }
                  : week,
              ),
            }
          : record,
      ),
    }))
  }

  const startEditingSection = (section: Section) => {
    setEditingSection(section.id)
    setEditingSectionName(section.name)
    setEditingSectionImages([...section.imageUrls])
    setNewImageUrl("")
  }

  const saveSection = (recordId: string, weekId: string, sectionId: string) => {
    setData((prev) => ({
      ...prev,
      records: prev.records.map((record) =>
        record.id === recordId
          ? {
              ...record,
              weeks: record.weeks.map((week) =>
                week.id === weekId
                  ? {
                      ...week,
                      sections: week.sections.map((section) =>
                        section.id === sectionId
                          ? { ...section, name: editingSectionName, imageUrls: editingSectionImages }
                          : section,
                      ),
                    }
                  : week,
              ),
            }
          : record,
      ),
    }))
    setEditingSection(null)
  }

  const cancelEditing = () => {
    setEditingSection(null)
    setEditingSectionName("")
    setEditingSectionImages([])
    setNewImageUrl("")
  }

  const addImageToSection = () => {
    if (newImageUrl.trim()) {
      setEditingSectionImages([...editingSectionImages, newImageUrl.trim()])
      setNewImageUrl("")
    }
  }

  const removeImageFromSection = (index: number) => {
    setEditingSectionImages(editingSectionImages.filter((_, i) => i !== index))
  }

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const resetZoom = () => {
    setZoomLevel(1)
    setImagePosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const openImageModal = (images: string[], index: number) => {
    setSelectedImages(images)
    setCurrentImageIndex(index)
    setIsImageModalOpen(true)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev < selectedImages.length - 1 ? prev + 1 : prev))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-center">
                <img
                  src={data.studentImage || "/placeholder.svg"}
                  alt="Estudiante"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-primary shadow-lg mx-auto"
                />
                <p className="text-xs text-muted-foreground mt-1">Estudiante</p>
              </div>
              <div className="text-center">
                <img
                  src={data.teacherImage || "/placeholder.svg"}
                  alt="Docente"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-secondary shadow-lg mx-auto"
                />
                <p className="text-xs text-muted-foreground mt-1">Docente</p>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                📚 <span className="hidden sm:inline">Portafolio de Matemáticas 4</span>
                <span className="sm:hidden">Portafolio de Matemáticas 4</span>
              </h1>
              <div className="flex flex-col gap-1 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{data.studentName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{data.teacherName}</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? "destructive" : "secondary"}
            className="flex items-center gap-2 animate-pulse-glow text-xs sm:text-sm px-3 py-2 w-full sm:w-auto"
          >
            {isEditMode ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
            {isEditMode ? "Vista Previa" : "Modo Edición"}
          </Button>
        </div>
      </div>

      {/* Records */}
      <div className="space-y-4 sm:space-y-6">
        {data.records.map((record, recordIndex) => (
          <Card
            key={record.id}
            className="animate-bounce-in shadow-xl border-2 border-primary/20"
            style={{ animationDelay: `${recordIndex * 0.1}s` }}
          >
            <CardHeader className="bg-gradient-to-r from-primary to-amber-500 text-white rounded-t-lg p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                  {record.name}
                </CardTitle>
                {isEditMode && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => createWeek(record.id)}
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Semana
                    </Button>
                    <Button
                      onClick={() => deleteRecord(record.id)}
                      size="sm"
                      variant="destructive"
                      className="bg-red-500/80 hover:bg-red-600 px-2 sm:px-3"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid gap-4 sm:gap-6">
                {record.weeks.map((week, weekIndex) => (
                  <Card
                    key={week.id}
                    className="border-2 border-secondary/30 animate-slide-up"
                    style={{ animationDelay: `${weekIndex * 0.1}s` }}
                  >
                    <CardHeader className="bg-gradient-to-r from-secondary to-indigo-500 text-white p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                          {week.name}
                        </CardTitle>
                        {isEditMode && (
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              onClick={() => createSection(record.id, week.id, "task")}
                              size="sm"
                              variant="secondary"
                              className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex-1 sm:flex-none text-xs"
                            >
                              <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Tarea
                            </Button>
                            <Button
                              onClick={() => createSection(record.id, week.id, "exercise")}
                              size="sm"
                              variant="secondary"
                              className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex-1 sm:flex-none text-xs"
                            >
                              <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Ejercicio
                            </Button>
                            <Button
                              onClick={() => deleteWeek(record.id, week.id)}
                              size="sm"
                              variant="destructive"
                              className="bg-red-500/80 hover:bg-red-600 px-2"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {week.sections.map((section, sectionIndex) => (
                          <Card
                            key={section.id}
                            className={`transition-all duration-300 hover:scale-105 hover:shadow-lg animate-bounce-in ${
                              section.type === "task"
                                ? "border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50"
                                : "border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50"
                            }`}
                            style={{ animationDelay: `${sectionIndex * 0.1}s` }}
                          >
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start justify-between mb-3">
                                <Badge
                                  variant={section.type === "task" ? "default" : "secondary"}
                                  className={`${
                                    section.type === "task"
                                      ? "bg-amber-500 hover:bg-amber-600"
                                      : "bg-emerald-500 hover:bg-emerald-600"
                                  } text-white text-xs`}
                                >
                                  {section.type === "task" ? (
                                    <CheckSquare className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                  ) : (
                                    <Dumbbell className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                  )}
                                  {section.type === "task" ? "Tarea" : "Ejercicio"}
                                </Badge>
                                {isEditMode && (
                                  <div className="flex gap-1">
                                    <Button
                                      onClick={() => startEditingSection(section)}
                                      size="sm"
                                      variant="ghost"
                                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1"
                                    >
                                      <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                    <Button
                                      onClick={() => deleteSection(record.id, week.id, section.id)}
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                                    >
                                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {editingSection === section.id ? (
                                <div className="space-y-3">
                                  <Input
                                    value={editingSectionName}
                                    onChange={(e) => setEditingSectionName(e.target.value)}
                                    placeholder="Nombre de la sección"
                                    className="text-sm"
                                  />

                                  <div className="space-y-2">
                                    <div className="flex gap-2">
                                      <Input
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        placeholder="URL de imagen"
                                        className="text-sm"
                                      />
                                      <Button
                                        onClick={addImageToSection}
                                        size="sm"
                                        variant="outline"
                                        className="px-2 bg-transparent"
                                      >
                                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </Button>
                                    </div>

                                    {editingSectionImages.length > 0 && (
                                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                        {editingSectionImages.map((url, index) => (
                                          <div key={index} className="relative group">
                                            <img
                                              src={url || "/placeholder.svg"}
                                              alt={`Imagen ${index + 1}`}
                                              className="w-full h-12 sm:h-16 object-cover rounded border"
                                            />
                                            <Button
                                              onClick={() => removeImageFromSection(index)}
                                              size="sm"
                                              variant="destructive"
                                              className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <X className="w-2 h-2 sm:w-3 sm:h-3" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => saveSection(record.id, week.id, section.id)}
                                      size="sm"
                                      variant="default"
                                      className="flex-1 text-xs"
                                    >
                                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                      Guardar
                                    </Button>
                                    <Button
                                      onClick={cancelEditing}
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 bg-transparent text-xs"
                                    >
                                      <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base line-clamp-2">
                                    {section.name}
                                  </h4>

                                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                    <Clock className="w-3 h-3" />
                                    <span className="truncate">{formatDateTime(section.createdAt)}</span>
                                  </div>

                                  {section.imageUrls.length > 0 ? (
                                    <div className="space-y-2">
                                      <div
                                        className="relative group cursor-pointer"
                                        onClick={() => openImageModal(section.imageUrls, 0)}
                                      >
                                        <img
                                          src={section.imageUrls[0] || "/placeholder.svg"}
                                          alt={section.name}
                                          className="w-full h-24 sm:h-32 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg flex items-center justify-center">
                                          <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        {section.imageUrls.length > 1 && (
                                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                            +{section.imageUrls.length - 1} más
                                          </div>
                                        )}
                                      </div>

                                      {section.imageUrls.length > 1 && (
                                        <div className="grid grid-cols-3 gap-1">
                                          {section.imageUrls.slice(1, 4).map((url, index) => (
                                            <img
                                              key={index}
                                              src={url || "/placeholder.svg"}
                                              alt={`${section.name} ${index + 2}`}
                                              className="w-full h-12 sm:h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                              onClick={() => openImageModal(section.imageUrls, index + 1)}
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div
                                      className="relative group cursor-pointer"
                                      onClick={() => openImageModal([DEFAULT_IMAGE], 0)}
                                    >
                                      <img
                                        src={DEFAULT_IMAGE || "/placeholder.svg"}
                                        alt={section.name}
                                        className="w-full h-24 sm:h-32 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-gray-900 border-gray-700">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-center text-white flex items-center justify-between">
              <span>
                Galería de Imágenes ({currentImageIndex + 1} de {selectedImages.length})
              </span>
              <div className="flex items-center gap-2 p-3">
                <Button
                  onClick={zoomOut}
                  variant="secondary"
                  size="sm"
                  className="bg-gray-800/80 hover:bg-gray-700 text-white border-gray-600"
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-300 min-w-[60px] text-center">{Math.round(zoomLevel * 100)}%</span>
                <Button
                  onClick={zoomIn}
                  variant="secondary"
                  size="sm"
                  className="bg-gray-800/80 hover:bg-gray-700 text-white border-gray-600"
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  onClick={resetZoom}
                  variant="secondary"
                  size="sm"
                  className="bg-gray-800/80 hover:bg-gray-700 text-white border-gray-600"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div
            className="relative p-6 overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="flex items-center justify-center min-h-[60vh]">
              <img
                src={selectedImages[currentImageIndex] || "/placeholder.svg"}
                alt={`Imagen ${currentImageIndex + 1}`}
                className={`max-h-[60vh] object-contain rounded-lg transition-transform duration-200 ${
                  zoomLevel > 1 ? "cursor-grab" : "cursor-default"
                } ${isDragging ? "cursor-grabbing" : ""}`}
                style={{
                  transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                  transformOrigin: "center center",
                }}
                onMouseDown={handleMouseDown}
                draggable={false}
              />
            </div>

            {selectedImages.length > 1 && (
              <>
                <Button
                  onClick={prevImage}
                  variant="secondary"
                  size="sm"
                  className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700 text-white border-gray-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={nextImage}
                  variant="secondary"
                  size="sm"
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700 text-white border-gray-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create new record button */}
      {isEditMode && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6">
          <Button
            onClick={createRecord}
            size="lg"
            className="rounded-full shadow-lg animate-pulse-glow bg-primary hover:bg-primary/90 w-12 h-12 sm:w-auto sm:h-auto sm:px-6 sm:py-3"
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Crear Nuevo Registro</span>
          </Button>
        </div>
      )}

      {/* Dialog for creating new sections with input fields */}
      <Dialog open={isCreatingSection} onOpenChange={setIsCreatingSection}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Crear {newSectionType === "task" ? "Tarea" : "Ejercicio en Clase"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre:</label>
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder={`Nombre de la ${newSectionType === "task" ? "tarea" : "ejercicio"}`}
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Agregar Imágenes:</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newSectionImageUrl}
                  onChange={(e) => setNewSectionImageUrl(e.target.value)}
                  placeholder="URL de imagen"
                  className="text-sm"
                />
                <Button onClick={addImageToNewSection} size="sm" variant="outline" className="px-2 bg-transparent">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {newSectionImages.length > 0 && (
              <div>
                <label className="text-sm font-medium">Imágenes agregadas:</label>
                <div className="grid grid-cols-2 gap-2 mt-1 max-h-32 overflow-y-auto">
                  {newSectionImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-12 sm:h-16 object-cover rounded border"
                      />
                      <Button
                        onClick={() => removeImageFromNewSection(index)}
                        size="sm"
                        variant="destructive"
                        className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2 h-2 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={saveNewSection} className="flex-1 text-sm" disabled={!newSectionName.trim()}>
                <Save className="w-4 h-4 mr-1" />
                Crear
              </Button>
              <Button onClick={cancelNewSection} variant="outline" className="flex-1 bg-transparent text-sm">
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
