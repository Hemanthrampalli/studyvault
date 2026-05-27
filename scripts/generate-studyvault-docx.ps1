param(
  [string]$SourcePath,
  [string]$OutputPath
)

$ErrorActionPreference = 'Stop'

if (-not $SourcePath) {
  $SourcePath = Join-Path $PSScriptRoot '..\docs\StudyVault_Project_Profile.md'
}

if (-not $OutputPath) {
  $OutputPath = Join-Path $PSScriptRoot '..\docs\StudyVault_Project_Profile.docx'
}

$SourcePath = [System.IO.Path]::GetFullPath($SourcePath)
$OutputPath = [System.IO.Path]::GetFullPath($OutputPath)

if (-not (Test-Path -LiteralPath $SourcePath)) {
  throw "Source markdown was not found: $SourcePath"
}

function Escape-Xml([string]$Text) {
  if ($null -eq $Text) { return '' }
  return [System.Security.SecurityElement]::Escape($Text)
}

function Write-Utf8NoBom([string]$Path, [string]$Content) {
  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function New-Paragraph([string]$Text, [string]$Style = 'Normal') {
  $escaped = Escape-Xml $Text
  $stylePart = ''
  if ($Style -ne 'Normal') {
    $stylePart = "<w:pPr><w:pStyle w:val=""$Style""/></w:pPr>"
  }
  return "<w:p>$stylePart<w:r><w:t xml:space=""preserve"">$escaped</w:t></w:r></w:p>"
}

function New-Table($Rows) {
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.Append('<w:tbl>')
  [void]$sb.Append('<w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="B7C3D0"/><w:left w:val="single" w:sz="4" w:space="0" w:color="B7C3D0"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="B7C3D0"/><w:right w:val="single" w:sz="4" w:space="0" w:color="B7C3D0"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="B7C3D0"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="B7C3D0"/></w:tblBorders></w:tblPr>')

  foreach ($row in $Rows) {
    [void]$sb.Append('<w:tr>')
    foreach ($cell in $row) {
      [void]$sb.Append('<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr>')
      [void]$sb.Append((New-Paragraph $cell 'Normal'))
      [void]$sb.Append('</w:tc>')
    }
    [void]$sb.Append('</w:tr>')
  }

  [void]$sb.Append('</w:tbl>')
  [void]$sb.Append((New-Paragraph '' 'Normal'))
  return $sb.ToString()
}

function Split-MarkdownTableRow([string]$Line) {
  $trimmed = $Line.Trim()
  if ($trimmed.StartsWith('|')) {
    $trimmed = $trimmed.Substring(1)
  }
  if ($trimmed.EndsWith('|')) {
    $trimmed = $trimmed.Substring(0, $trimmed.Length - 1)
  }
  return @($trimmed -split '\|' | ForEach-Object { $_.Trim() })
}

function Test-SeparatorRow($Cells) {
  if ($Cells.Count -eq 0) { return $false }
  foreach ($cell in $Cells) {
    if ($cell -notmatch '^:?-{3,}:?$') {
      return $false
    }
  }
  return $true
}

$bodyParts = New-Object System.Collections.Generic.List[string]
$lines = Get-Content -LiteralPath $SourcePath
$firstHeading = $true

for ($i = 0; $i -lt $lines.Count; $i++) {
  $line = $lines[$i]
  $trimmed = $line.Trim()

  if ($trimmed.Length -eq 0) {
    continue
  }

  if ($trimmed.StartsWith('|')) {
    $tableRows = New-Object System.Collections.Generic.List[object]
    while ($i -lt $lines.Count -and $lines[$i].Trim().StartsWith('|')) {
      $cells = Split-MarkdownTableRow $lines[$i]
      if (-not (Test-SeparatorRow $cells)) {
        $tableRows.Add($cells)
      }
      $i++
    }
    $i--
    $bodyParts.Add((New-Table $tableRows))
    continue
  }

  if ($trimmed -match '^###\s+(.+)$') {
    $bodyParts.Add((New-Paragraph $Matches[1] 'Heading2'))
    continue
  }

  if ($trimmed -match '^##\s+(.+)$') {
    $bodyParts.Add((New-Paragraph $Matches[1] 'Heading1'))
    continue
  }

  if ($trimmed -match '^#\s+(.+)$') {
    if ($firstHeading) {
      $bodyParts.Add((New-Paragraph $Matches[1] 'Title'))
      $firstHeading = $false
    } else {
      $bodyParts.Add((New-Paragraph $Matches[1] 'Heading1'))
    }
    continue
  }

  if ($trimmed -match '^- \s*(.+)$') {
    $bodyParts.Add((New-Paragraph "- $($Matches[1])" 'ListParagraph'))
    continue
  }

  if ($trimmed -match '^\d+\.\s+(.+)$') {
    $bodyParts.Add((New-Paragraph $trimmed 'ListParagraph'))
    continue
  }

  $bodyParts.Add((New-Paragraph $trimmed 'Normal'))
}

$documentBody = [string]::Join("`n", $bodyParts)
$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
$documentBody
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$stylesXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="22"/><w:color w:val="1F2937"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="240" w:after="260"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Aptos Display" w:hAnsi="Aptos Display"/><w:b/><w:sz w:val="44"/><w:color w:val="0052FF"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:keepNext/><w:spacing w:before="360" w:after="160"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Aptos Display" w:hAnsi="Aptos Display"/><w:b/><w:sz w:val="32"/><w:color w:val="0B1C30"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Aptos Display" w:hAnsi="Aptos Display"/><w:b/><w:sz w:val="26"/><w:color w:val="003EC7"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:ind w:left="360"/><w:spacing w:after="80"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="B7C3D0"/><w:left w:val="single" w:sz="4" w:space="0" w:color="B7C3D0"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="B7C3D0"/><w:right w:val="single" w:sz="4" w:space="0" w:color="B7C3D0"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="B7C3D0"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="B7C3D0"/></w:tblBorders></w:tblPr>
  </w:style>
</w:styles>
'@

$contentTypesXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
'@

$relsXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'@

$documentRelsXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
'@

$created = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
$coreXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>StudyVault Project Profile and Promotion Kit</dc:title>
  <dc:creator>Hemanth Rampalli</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$created</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$created</dcterms:modified>
</cp:coreProperties>
"@

$appXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>StudyVault Generator</Application>
</Properties>
'@

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("studyvault-docx-" + [System.Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $tempRoot, (Join-Path $tempRoot '_rels'), (Join-Path $tempRoot 'word'), (Join-Path $tempRoot 'word\_rels'), (Join-Path $tempRoot 'docProps') | Out-Null

Write-Utf8NoBom (Join-Path $tempRoot '[Content_Types].xml') $contentTypesXml
Write-Utf8NoBom (Join-Path $tempRoot '_rels\.rels') $relsXml
Write-Utf8NoBom (Join-Path $tempRoot 'word\document.xml') $documentXml
Write-Utf8NoBom (Join-Path $tempRoot 'word\styles.xml') $stylesXml
Write-Utf8NoBom (Join-Path $tempRoot 'word\_rels\document.xml.rels') $documentRelsXml
Write-Utf8NoBom (Join-Path $tempRoot 'docProps\core.xml') $coreXml
Write-Utf8NoBom (Join-Path $tempRoot 'docProps\app.xml') $appXml

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutputPath) | Out-Null
if (Test-Path -LiteralPath $OutputPath) {
  Remove-Item -LiteralPath $OutputPath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archive = [System.IO.Compression.ZipFile]::Open($OutputPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  Get-ChildItem -LiteralPath $tempRoot -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($tempRoot.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $archive,
      $_.FullName,
      $relativePath,
      [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
  }
}
finally {
  $archive.Dispose()
}

Remove-Item -LiteralPath $tempRoot -Recurse -Force

Write-Host "Created Word document: $OutputPath"
