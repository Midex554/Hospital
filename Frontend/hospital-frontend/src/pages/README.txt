MediCore HMS Dark Mode Updated Pages

Copy these files into your src/pages folder (or matching folder) and replace the old versions.

Important:
1. Make sure tailwind.config.js has: darkMode: "class"
2. Make sure DashboardLayout.jsx toggles the 'dark' class on document.documentElement.
3. These files mainly fix hardcoded bg-white/text-slate/border-slate classes.
4. If DashboardLayout.jsx still has hardcoded white background, send it next because it controls the whole page shell.
