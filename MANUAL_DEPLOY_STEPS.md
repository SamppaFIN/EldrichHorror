# 🚀 Manual Deployment Steps

**Path encoding issues detected** - Follow these manual steps instead:

## Step-by-Step Deployment

### 1. Open Command Prompt or Git Bash
Navigate to the Klitoritari folder manually in File Explorer, then:
- **Right-click** in the folder
- Select "Open in Terminal" or "Git Bash Here"

### 2. Initialize Git Repository
```bash
git init
```

### 3. Add All Files
```bash
git add .
```

### 4. Create Initial Commit
```bash
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
```

### 5. Add GitHub Remote
```bash
git remote add origin https://github.com/SamppaFIN/EldrichHorror.git
```

### 6. Set Branch to Main
```bash
git branch -M main
```

### 7. Force Push (Override Existing)
```bash
git push -u origin main --force
```

**⚠️ This will override everything in the GitHub repository!**

---

## What Happens Next

1. ✅ Code pushed to GitHub
2. ✅ GitHub Actions workflow triggers automatically
3. ✅ Deploys `/game` folder to GitHub Pages
4. ✅ Game live at: https://samppafin.github.io/EldrichHorror/

---

## Enable GitHub Pages (One-Time Setup)

If not already enabled:

1. Go to: https://github.com/SamppaFIN/EldrichHorror/settings/pages
2. Under "Build and deployment":
   - Source: **GitHub Actions** (recommended)
   - Or: **Deploy from a branch** → main → /game
3. Click **Save**

---

## Verify Deployment

### Check Build Status
https://github.com/SamppaFIN/EldrichHorror/actions

### Test Live Site
https://samppafin.github.io/EldrichHorror/

Should show:
- Loading screen with starfield
- Map with your location
- 5-10 discovery markers
- Cosmic-themed UI

---

## Troubleshooting

### Authentication Error
If git asks for credentials:

**Option 1: Personal Access Token**
- Username: `SamppaFIN`
- Password: `<your-github-personal-access-token>`
- Create token at: https://github.com/settings/tokens

**Option 2: GitHub CLI**
```bash
gh auth login
git push -u origin main --force
```

### Path Not Found
- Make sure you're in the correct folder
- Check folder contains `game/` directory
- Verify `.git` folder was created

### Push Rejected (Protected Branch)
- Go to repo Settings > Branches
- Remove branch protection rules
- Try push again

---

## Quick Commands Reference

```bash
# Check status
git status

# See what files are staged
git ls-files

# View remote
git remote -v

# Check branch
git branch

# Force push (if needed again)
git push origin main --force
```

---

**Ready to deploy!** 🌸

Follow the steps above in your terminal and your game will be live on GitHub Pages within 2-3 minutes.

Let me know when it's deployed and I can help you test it! 🎮
