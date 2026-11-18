[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$argLine = $Arguments -join ' '
cmd.exe /c "`"$PSScriptRoot\mvnw.cmd`" $argLine"
exit $LASTEXITCODE
