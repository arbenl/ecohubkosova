import React from "react"

type Props = {
  message?: string
}

export default function DbIssueBanner({ message }: Props) {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 p-3 text-sm text-yellow-800">
      {message ??
        "Ka pasur një problem të përkohshëm me bazën e të dhënave. Po e shërbejme përpjekjen automatikisht — disa veçori mund të jenë të kufizuara."}
    </div>
  )
}
