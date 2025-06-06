declare namespace Vis {
  interface Style {
    [key: string | number | symbol]: JSONValue | undefined
    DevelopmentMode: boolean
    showArrows: boolean
    scaleObjects: boolean
    pathEnd: string
    useForceLayout: boolean
  }
}
