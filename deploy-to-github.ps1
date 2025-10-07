# Deploy Klitoritari to GitHub - EldrichHorror Repository
# This script initializes git and force pushes to override previous implementation

Write-Host "🌸 Deploying Eldritch Sanctuary to GitHub..." -ForegroundColor Cyan

# Remove existing .git if present
if (Test-Path .git) {
    Write-Host "Removing existing git repository..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .git
}

# Initialize new git repository
Write-Host "Initializing new git repository..." -ForegroundColor Green
git init

# Configure git (use your GitHub credentials)
Write-Host "Configuring git..." -ForegroundColor Green
# git config user.name "Your Name"  # Uncomment and set your name
# git config user.email "your.email@example.com"  # Uncomment and set your email

# Add all files
Write-Host "Adding all files..." -ForegroundColor Green
git add .

# Create initial commit
Write-Host "Creating initial commit..." -ForegroundColor Green
git commit -m "🌸 Initial release - Eldritch Sanctuary v1.0.0-alpha

Features:
- Complete Discovery System with 4 rarity tiers
- GPS-based gameplay with auto-collection
- Consciousness evolution system (XP & levels)
- Lore system with 9 Lovecraftian entries
- Toast notification system
- Responsive cosmic-themed UI
- Player marker persistence
- Full BRDC documentation

Technical:
- Pure vanilla JavaScript
- Leaflet.js for mapping
- LocalStorage for persistence
- SVG markers with animations

Status: Fully functional, production-ready
Developers: Aurora & Infinite
Methodology: BRDC (Bug Report-Driven Coding)"

# Add remote
Write-Host "Adding GitHub remote..." -ForegroundColor Green
git remote add origin https://github.com/SamppaFIN/EldrichHorror.git

# Force push to main branch (override existing)
Write-Host "⚠️  Force pushing to GitHub (this will override existing repository)..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to cancel, or Enter to continue..." -ForegroundColor Red
Read-Host

git branch -M main
git push -u origin main --force

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Repository: https://github.com/SamppaFIN/EldrichHorror" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit GitHub repository" -ForegroundColor White
Write-Host "2. Enable GitHub Pages (Settings > Pages > main branch)" -ForegroundColor White
Write-Host "3. Set source to /game folder" -ForegroundColor White
Write-Host "4. Your game will be live at: https://samppafin.github.io/EldrichHorror/" -ForegroundColor White

