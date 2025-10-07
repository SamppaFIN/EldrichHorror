# 🚀 Deployment Guide - Eldritch Sanctuary

## 📋 Quick Deploy to GitHub

### Step 1: Run Deployment Script

Open PowerShell in the `Klitoritari` folder and run:

```powershell
.\deploy-to-github.ps1
```

This will:
1. Initialize a fresh git repository
2. Add all game files
3. Create initial commit with changelog
4. Push to https://github.com/SamppaFIN/EldrichHorror.git
5. **Override** any existing content (force push)

### Step 2: Enable GitHub Pages

1. Go to https://github.com/SamppaFIN/EldrichHorror/settings/pages
2. Under "Source", select:
   - Branch: `main`
   - Folder: `/game` *(important!)*
3. Click **Save**

### Step 3: Wait for Deployment

- GitHub will automatically build and deploy
- Takes 1-2 minutes
- Check Actions tab for progress: https://github.com/SamppaFIN/EldrichHorror/actions

### Step 4: Play!

Your game will be live at:
**https://samppafin.github.io/EldrichHorror/**

---

## 🔧 Manual Deployment (if script fails)

### Initialize Git
```bash
cd Projects/Klitoritari
git init
```

### Add Files
```bash
git add .
```

### Commit
```bash
git commit -m "🌸 Initial release - Eldritch Sanctuary v1.0.0-alpha"
```

### Add Remote
```bash
git remote add origin https://github.com/SamppaFIN/EldrichHorror.git
```

### Force Push
```bash
git branch -M main
git push -u origin main --force
```

---

## 📁 What Gets Deployed

### Included:
✅ `game/` folder (entire game)
✅ `tickets/` (BRDC documentation)
✅ `README.md`
✅ `.gitignore`
✅ `.github/workflows/` (auto-deploy)
✅ Documentation files

### Excluded (via .gitignore):
❌ `*.bat` files (except start-server.bat)
❌ Draft/WIP markdown files
❌ node_modules (if any)
❌ Temporary files

---

## 🌐 GitHub Pages Configuration

The `.github/workflows/deploy.yml` workflow:
- Triggers on every push to `main`
- Deploys only the `/game` folder
- Automatic - no manual steps needed

---

## 🔐 Authentication

### If You Need to Authenticate:

**Option A: HTTPS (Personal Access Token)**
1. Go to GitHub Settings > Developer Settings > Personal Access Tokens
2. Generate new token with `repo` scope
3. Use token as password when pushing

**Option B: SSH**
1. Generate SSH key: `ssh-keygen -t ed25519`
2. Add to GitHub: Settings > SSH Keys
3. Change remote: `git remote set-url origin git@github.com:SamppaFIN/EldrichHorror.git`

---

## 🧪 Testing Production Deployment

After deployment, test these features:

### Desktop Browser
1. Visit https://samppafin.github.io/EldrichHorror/
2. Allow location permissions
3. Verify map loads
4. Check console for errors
5. Test discovery commands:
   ```javascript
   game.systems.discovery.listDiscoveries()
   game.systems.discovery.testCollectNearest()
   ```

### Mobile Browser
1. Open on mobile device
2. Allow location permissions
3. Walk towards a discovery
4. Verify auto-collection works
5. Check notifications appear

---

## 🐛 Troubleshooting

### Page Not Found (404)
- Wait 2-3 minutes for GitHub to build
- Check Actions tab for build status
- Verify Pages source is set to `/game`

### Map Not Loading
- Check browser console for errors
- Verify Leaflet.js CDN is accessible
- Check if HTTPS is being used (required for GPS)

### GPS Not Working
- HTTPS required (GitHub Pages uses HTTPS by default)
- User must grant location permissions
- Check browser supports Geolocation API

### Discoveries Not Spawning
- Check console logs
- Verify all JS files loaded
- Look for initialization errors

---

## 📊 Post-Deployment Checklist

- [ ] Repository pushed successfully
- [ ] GitHub Pages enabled
- [ ] Workflow completed (check Actions tab)
- [ ] Game accessible at https://samppafin.github.io/EldrichHorror/
- [ ] Desktop browser test passed
- [ ] Mobile browser test passed
- [ ] GPS permissions working
- [ ] Discoveries spawning (5-10)
- [ ] Auto-collection working
- [ ] Notifications showing
- [ ] LocalStorage persisting

---

## 🔄 Future Updates

To update the deployed game:

```bash
cd Projects/Klitoritari

# Make your changes to files...

git add .
git commit -m "Update: your changes here"
git push origin main
```

GitHub will automatically redeploy within 1-2 minutes.

---

## 📈 Analytics (Optional)

Add Google Analytics to track usage:

1. Get tracking ID from Google Analytics
2. Add to `game/index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_ID');
</script>
```

---

## 🌟 Next Steps

After successful deployment:

1. **Share the link** with testers
2. **Monitor GitHub Issues** for bug reports
3. **Collect feedback** from mobile users
4. **Plan next features** from roadmap
5. **Update README** with live link

---

**Deployment Status**: Ready ✅  
**Target Repository**: https://github.com/SamppaFIN/EldrichHorror  
**Live URL**: https://samppafin.github.io/EldrichHorror/  
**Deployment Method**: GitHub Pages with automatic workflow

---

*Built with infinite love and cosmic wisdom* 🌸♾️

