"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Upload, RotateCcw } from "lucide-react"
import Image from "next/image"

interface TextSettings {
  text: string
  fontSize: number
  fontWeight: string
  fontStyle: string
  color: string
  textAlign: string
  letterSpacing: number
  lineHeight: number
  shadowOffsetX: number
  shadowOffsetY: number
  shadowBlur: number
  shadowColor: string
  strokeWidth: number
  strokeColor: string
}

interface BackgroundSettings {
  type: "color" | "image"
  color: string
  image: string | null
}

export default function GTATextGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  const [textSettings, setTextSettings] = useState<TextSettings>({
    text: "GRAND THEFT AUTO",
    fontSize: 72,
    fontWeight: "900",
    fontStyle: "normal",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0,
    lineHeight: 1.2,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: "#000000",
    strokeWidth: 10,
    strokeColor: "#000000",
  })

  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({
    type: "color",
    color: "#dbdbdb",
    image: null,
  })

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 })

  // GTA Game covers data
  const gameCovers = [
    {
      src: "/images/gta-vice-city-cover.jpg",
      alt: "GTA Vice City Stories Cover",
      title: "Vice City Stories",
    },
    {
      src: "/images/gta-san-andreas-cover.jpg",
      alt: "GTA San Andreas Cover",
      title: "San Andreas",
    },
    {
      src: "/images/gta-3-cover.jpg",
      alt: "GTA III Cover",
      title: "GTA III",
    },
    {
      src: "/images/gta-vice-city-cover-alt.png",
      alt: "GTA Vice City Cover",
      title: "Vice City",
    },
  ]

  // Load fonts
  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Load the authentic Pricedown font directly from GitHub
        const pricdownFont = new FontFace(
          "Pricedown",
          "url(https://raw.githubusercontent.com/infin1tyy/pricedown-font-web/master/pricedown.otf)",
        )
        await pricdownFont.load()
        document.fonts.add(pricdownFont)

        // Add fallback font as backup
        try {
          const fallbackFont = new FontFace(
            "Pricedown-Fallback",
            "url(/fonts/pricedown.otf)",
          )
          await fallbackFont.load()
          document.fonts.add(fallbackFont)
        } catch (fallbackError) {
          console.warn("Fallback font failed to load:", fallbackError)
        }

        await document.fonts.ready
        setFontsLoaded(true)
        console.log("Authentic Pricedown font loaded successfully from GitHub!")
      } catch (error) {
        console.error("Failed to load Pricedown font from GitHub:", error)
        // Try to load fallback
        // try {
        //   const fallbackFont = new FontFace(
        //     "Pricedown-Fallback",
        //     "url(https://fonts.cdnfonts.com/s/15011/pricedown.woff)",
        //   )
        //   await fallbackFont.load()
        //   document.fonts.add(fallbackFont)
        //   setFontsLoaded(true)
        //   console.log("Fallback font loaded")
        // } catch (fallbackError) {
        //   console.error("All fonts failed to load:", fallbackError)
        //   setFontsLoaded(true) // Continue with system fonts
        // }
      }
    }

    loadFonts()
  }, [])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    if (backgroundSettings.type === "color") {
      ctx.fillStyle = backgroundSettings.color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else if (backgroundSettings.type === "image" && backgroundSettings.image) {
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        drawText(ctx)
      }
      img.src = backgroundSettings.image
      return
    }

    drawText(ctx)
  }, [textSettings, backgroundSettings, canvasSize])

  const drawText = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Always use Pricedown font
    const fontFamily = "Pricedown, Impact, 'Arial Black', sans-serif"

    ctx.font = `${textSettings.fontStyle} ${textSettings.fontWeight} ${textSettings.fontSize}px ${fontFamily}`

    // Set text properties
    ctx.fillStyle = textSettings.color
    ctx.textAlign = textSettings.textAlign as CanvasTextAlign
    ctx.textBaseline = "middle"

    // Set shadow
    ctx.shadowOffsetX = textSettings.shadowOffsetX
    ctx.shadowOffsetY = textSettings.shadowOffsetY
    ctx.shadowBlur = textSettings.shadowBlur
    ctx.shadowColor = textSettings.shadowColor

    // Set stroke
    ctx.strokeStyle = textSettings.strokeColor
    ctx.lineWidth = textSettings.strokeWidth

    // Calculate position
    let x = canvas.width / 2
    if (textSettings.textAlign === "left") x = 50
    if (textSettings.textAlign === "right") x = canvas.width - 50

    const lines = textSettings.text.split("\n")
    const lineHeight = textSettings.fontSize * textSettings.lineHeight
    const totalHeight = lines.length * lineHeight
    const startY = (canvas.height - totalHeight) / 2 + lineHeight / 2

    // Apply letter spacing by drawing each character individually
    lines.forEach((line, lineIndex) => {
      const y = startY + lineIndex * lineHeight

      if (textSettings.letterSpacing === 0) {
        // Draw normally if no letter spacing
        if (textSettings.strokeWidth > 0) {
          ctx.strokeText(line, x, y)
        }
        ctx.fillText(line, x, y)
      } else {
        // Draw with letter spacing
        const chars = line.split("")
        const totalWidth =
          chars.reduce((width, char) => {
            return width + ctx.measureText(char).width + textSettings.letterSpacing
          }, 0) - textSettings.letterSpacing

        let startX = x
        if (textSettings.textAlign === "center") {
          startX = x - totalWidth / 2
        } else if (textSettings.textAlign === "right") {
          startX = x - totalWidth
        }

        let currentX = startX
        chars.forEach((char) => {
          if (textSettings.strokeWidth > 0) {
            ctx.strokeText(char, currentX, y)
          }
          ctx.fillText(char, currentX, y)
          currentX += ctx.measureText(char).width + textSettings.letterSpacing
        })
      }
    })
  }

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const handleTextSettingChange = (key: keyof TextSettings, value: any) => {
    setTextSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleBackgroundSettingChange = (key: keyof BackgroundSettings, value: any) => {
    setBackgroundSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        handleBackgroundSettingChange("image", result)
        handleBackgroundSettingChange("type", "image")
      }
      reader.readAsDataURL(file)
    }
  }

  const exportImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "gta-text.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const resetSettings = () => {
    setTextSettings({
      text: "GRAND THEFT AUTO",
      fontSize: 72,
      fontWeight: "900",
      fontStyle: "normal",
      color: "#FFFFFF",
      textAlign: "center",
      letterSpacing: 0,
      lineHeight: 1.2,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 0,
      shadowColor: "#000000",
      strokeWidth: 10,
      strokeColor: "#00FFFF",
    })
    setBackgroundSettings({
      type: "color",
      color: "#0a1a2e",
      image: null,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-cyan-900 p-4 relative overflow-hidden">
      {/* Neon grid background effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20"></div>
        <div className="absolute inset-0 neon-grid"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8 relative">
          {/* GTA Game Covers Gallery */}
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-4xl">
              <div className="flex gap-4 overflow-x-auto game-covers-scroll justify-center p-4">
                {gameCovers.map((cover, index) => (
                  <div key={index} className="flex-shrink-0 relative group">
                    <Image
                      src={cover.src || "/placeholder.svg"}
                      alt={cover.alt}
                      width={160}
                      height={220}
                      className="rounded-lg shadow-2xl border-2 border-blue-500/50 hover:border-cyan-500/50 transition-all duration-300 group-hover:scale-105"
                      style={{
                        filter: "drop-shadow(0 0 20px rgba(0,191,255,0.3))",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-lg"></div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-bold text-center bg-black/50 rounded px-2 py-1 backdrop-blur-sm">
                        {cover.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h1
            className="text-5xl font-bold text-white mb-4 drop-shadow-lg"
            style={{
              fontFamily: "Pricedown, Impact, Arial Black, sans-serif",
            }}
          >
            GTA Text Generator
          </h1>
          <p className="text-cyan-300 text-lg font-medium">
            Create custom GTA-style text with the iconic Pricedown font
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Canvas Preview */}
          <div className="lg:col-span-2">
            <Card className="glass-card shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-blue-500/20">
                <CardTitle className="text-white text-xl font-bold">Preview</CardTitle>
                <div className="flex gap-2">
                  {/* <Button
                    onClick={resetSettings}
                    variant="outline"
                    size="sm"
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 bg-transparent"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button> */}
                  <Button
                    onClick={exportImage}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export PNG
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-black/60 p-4 rounded-lg border border-cyan-500/30">
                  <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className="w-full h-auto border border-blue-500/30 rounded shadow-lg"
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium">Canvas Width</Label>
                    <Input
                      type="number"
                      value={canvasSize.width}
                      onChange={(e) =>
                        setCanvasSize((prev) => ({ ...prev, width: Number.parseInt(e.target.value) || 800 }))
                      }
                      className="bg-black/50 border-blue-500/30 text-white focus:border-cyan-400 focus:ring-cyan-400"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-medium">Canvas Height</Label>
                    <Input
                      type="number"
                      value={canvasSize.height}
                      onChange={(e) =>
                        setCanvasSize((prev) => ({ ...prev, height: Number.parseInt(e.target.value) || 400 }))
                      }
                      className="bg-black/50 border-blue-500/30 text-white focus:border-cyan-400 focus:ring-cyan-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <Card className="glass-card shadow-2xl">
              <CardHeader className="border-b border-blue-500/20">
                <CardTitle className="text-white text-xl font-bold">Text Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-black/60 border border-blue-500/30 h-auto">
                    <TabsTrigger
                      value="basic"
                      className="text-cyan-300 data-[state=active]:bg-blue-600/50 data-[state=active]:text-white"
                    >
                      Style
                    </TabsTrigger>
                    <TabsTrigger
                      value="effects"
                      className="text-cyan-300 data-[state=active]:bg-blue-600/50 data-[state=active]:text-white"
                    >
                      Effects
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-6">
                    <div>
                      <Label className="text-white font-medium">Text</Label>
                      <textarea
                        value={textSettings.text}
                        onChange={(e) => handleTextSettingChange("text", e.target.value)}
                        className="w-full p-3 bg-black/50 border border-blue-500/30 rounded text-white resize-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                        rows={3}
                        placeholder="Enter your text here..."
                      />
                    </div>

                    <div>
                      <Label className="text-white font-medium">Font Size: {textSettings.fontSize}px</Label>
                      <Slider
                        value={[textSettings.fontSize]}
                        onValueChange={(value) => handleTextSettingChange("fontSize", value[0])}
                        max={200}
                        min={12}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-white font-medium">Text Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={textSettings.color}
                          onChange={(e) => handleTextSettingChange("color", e.target.value)}
                          className="w-12 h-10 p-1 bg-black/50 border-blue-500/30"
                        />
                        <Input
                          type="text"
                          value={textSettings.color}
                          onChange={(e) => handleTextSettingChange("color", e.target.value)}
                          className="flex-1 bg-black/50 border-blue-500/30 text-white focus:border-cyan-400 focus:ring-cyan-400"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white font-medium">Letter Spacing: {textSettings.letterSpacing}px</Label>
                      <Slider
                        value={[textSettings.letterSpacing]}
                        onValueChange={(value) => handleTextSettingChange("letterSpacing", value[0])}
                        max={20}
                        min={-5}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-white font-medium">Line Height: {textSettings.lineHeight}</Label>
                      <Slider
                        value={[textSettings.lineHeight]}
                        onValueChange={(value) => handleTextSettingChange("lineHeight", value[0])}
                        max={3}
                        min={0.5}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="effects" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Text Shadow</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-white">Offset X: {textSettings.shadowOffsetX}</Label>
                          <Slider
                            value={[textSettings.shadowOffsetX]}
                            onValueChange={(value) => handleTextSettingChange("shadowOffsetX", value[0])}
                            max={20}
                            min={-20}
                            step={1}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-white">Offset Y: {textSettings.shadowOffsetY}</Label>
                          <Slider
                            value={[textSettings.shadowOffsetY]}
                            onValueChange={(value) => handleTextSettingChange("shadowOffsetY", value[0])}
                            max={20}
                            min={-20}
                            step={1}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-white">Blur: {textSettings.shadowBlur}</Label>
                        <Slider
                          value={[textSettings.shadowBlur]}
                          onValueChange={(value) => handleTextSettingChange("shadowBlur", value[0])}
                          max={30}
                          min={0}
                          step={1}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-white">Shadow Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={textSettings.shadowColor}
                            onChange={(e) => handleTextSettingChange("shadowColor", e.target.value)}
                            className="w-12 h-8 p-1 bg-black/50 border-blue-500/30"
                          />
                          <Input
                            type="text"
                            value={textSettings.shadowColor}
                            onChange={(e) => handleTextSettingChange("shadowColor", e.target.value)}
                            className="flex-1 bg-black/50 border-blue-500/30 text-white text-xs focus:border-cyan-400 focus:ring-cyan-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-medium">Text Stroke</Label>
                      <div>
                        <Label className="text-xs text-white">Width: {textSettings.strokeWidth}</Label>
                        <Slider
                          value={[textSettings.strokeWidth]}
                          onValueChange={(value) => handleTextSettingChange("strokeWidth", value[0])}
                          max={20}
                          min={0}
                          step={0.5}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-white">Stroke Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={textSettings.strokeColor}
                            onChange={(e) => handleTextSettingChange("strokeColor", e.target.value)}
                            className="w-12 h-8 p-1 bg-black/50 border-blue-500/30"
                          />
                          <Input
                            type="text"
                            value={textSettings.strokeColor}
                            onChange={(e) => handleTextSettingChange("strokeColor", e.target.value)}
                            className="flex-1 bg-black/50 border-blue-500/30 text-white text-xs focus:border-cyan-400 focus:ring-cyan-400"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-2xl">
              <CardHeader className="border-b border-blue-500/20">
                <CardTitle className="text-white text-xl font-bold">Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label className="text-white font-medium">Background Type</Label>
                  <Select
                    value={backgroundSettings.type}
                    onValueChange={(value: "color" | "image") => handleBackgroundSettingChange("type", value)}
                  >
                    <SelectTrigger className="bg-black/50 border-blue-500/30 text-white focus:border-cyan-400 focus:ring-cyan-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-blue-500/30">
                      <SelectItem value="color" className="text-cyan-200 focus:bg-blue-600/50">
                        Solid Color
                      </SelectItem>
                      <SelectItem value="image" className="text-cyan-200 focus:bg-blue-600/50">
                        Image
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {backgroundSettings.type === "color" && (
                  <div>
                    <Label className="text-white font-medium">Background Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={backgroundSettings.color}
                        onChange={(e) => handleBackgroundSettingChange("color", e.target.value)}
                        className="w-12 h-10 p-1 bg-black/50 border-blue-500/30"
                      />
                      <Input
                        type="text"
                        value={backgroundSettings.color}
                        onChange={(e) => handleBackgroundSettingChange("color", e.target.value)}
                        className="flex-1 bg-black/50 border-blue-500/30 text-white focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </div>
                  </div>
                )}

                {backgroundSettings.type === "image" && (
                  <div>
                    <Label className="text-white font-medium">Background Image</Label>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full mt-2 bg-black/50 border-blue-500/30 text-cyan-200 hover:bg-blue-600/20 hover:text-cyan-100"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
