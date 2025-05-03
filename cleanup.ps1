$directories = @(
    # App modules
    "src/app/(dashboard)",
    "src/app/academics",
    "src/app/admissions",
    "src/app/assessment",
    "src/app/attendance",
    "src/app/classroom",
    "src/app/classroom-management",
    "src/app/communication",
    "src/app/dashboard",
    "src/app/home",
    "src/app/login",
    "src/app/operations",
    "src/app/people",
    "src/app/settings",
    "src/app/signup",
    "src/app/teaching",
    "src/app/users",
    "src/modules",
    
    # Component directories
    "src/components/user",
    "src/components/teaching",
    "src/components/students",
    "src/components/permissions",
    "src/components/payroll",
    "src/components/leave-management",
    "src/components/leave",
    "src/components/budget",
    "src/components/inventory",
    "src/components/academics",
    "src/components/assessment",
    
    # Services and other directories
    "src/VO",
    "src/__tests__",
    "src/utility",
    "src/types",
    "src/services",
    "src/hooks"
)

# Files to remove
$files = @(
    # Component files
    "src/components/view-classroom.tsx",
    "src/components/classroom-selector.tsx",
    "src/components/mark-attendance.tsx",
    "src/components/modify-classroom-form.tsx",
    "src/components/batch-classroom-creator.tsx",
    "src/components/assign-users-to-class.tsx",
    "src/components/StudentList.tsx",
    "src/components/TeacherList.tsx",
    "src/components/login-form.tsx",
    "src/components/mobile-tab-selector.tsx",
    "src/components/breadcrumbs.tsx",
    "src/components/add-user-form.tsx",
    "src/components/view-user.tsx",
    "src/components/signup-from.tsx",
    "src/components/feature-tour.tsx",
    
    # Navigation components
    "src/components/nav-main.tsx",
    "src/components/nav-projects.tsx",
    "src/components/nav-secondary.tsx",
    "src/components/nav-user.tsx",
    "src/components/search-form.tsx",
    "src/components/team-switcher.tsx",
    
    # Other files
    "src/middleware.ts"
)

# Remove directories
foreach ($dir in $directories) {
    Write-Host "Removing $dir..."
    Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
}

# Remove files
foreach ($file in $files) {
    Write-Host "Removing $file..."
    Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
}

# Keep only basic UI components
$uiFiles = Get-ChildItem -Path "src/components/ui" -File
foreach ($file in $uiFiles) {
    # Basic UI components to keep
    $basicComponents = @(
        "button.tsx", 
        "card.tsx", 
        "input.tsx", 
        "theme-provider.tsx", 
        "mode-toggle.tsx",
        "sidebar.tsx"
    )
    if ($basicComponents -notcontains $file.Name) {
        Write-Host "Removing UI component: $($file.FullName)"
        Remove-Item -Path $file.FullName -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "All unnecessary files and directories have been removed." 