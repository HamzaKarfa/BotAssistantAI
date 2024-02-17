export default function getFileExtensionByLanguage(language?: string): string {
    if(!language) {
        return "txt"
    }

    const fileExtensionsByLanguage: { [key: string]: string } = {
        "python": "py",
        "javascript": "js",
        "typescript": "ts",
        "html": "html",
        "css": "css",
        "json": "json",
        "markdown": "md",
        "bash": "sh",
        "shell": "sh",
        "powershell": "ps1",
        "c": "c",
        "cpp": "cpp",
        "c++": "cpp",
        "c#": "cs",
        "java": "java",
        "ruby": "rb",
        "php": "php",
        "go": "go",
        "rust": "rs",
        "kotlin": "kt",
        "swift": "swift",
        "scala": "scala",
        "r": "r",
        "dart": "dart",
        "elixir": "ex",
        "lua": "lua",
        "clojure": "clj",
        "haskell": "hs",
        "erlang": "erl",
        "ocaml": "ml",
        "julia": "jl",
        "perl": "pl",
        "sql": "sql",
        "yaml": "yaml",
        "xml": "xml",
        "dockerfile": "dockerfile",
        "plaintext": "txt",
    }

    return fileExtensionsByLanguage[language] || "txt"
}