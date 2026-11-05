// Sidebar functionality
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuBtn = document.getElementById('menuBtn');
const closeSidebar = document.getElementById('closeSidebar');

// Toggle sidebar on mobile
menuBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
});

// Menu item functionality
const menuItems = document.querySelectorAll('.menu-item');
const submenuItems = document.querySelectorAll('.submenu-item');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const hasDropdown = item.getAttribute('data-dropdown') === 'true';
        const menuName = item.getAttribute('data-menu');
        
        if (hasDropdown) {
            // Toggle dropdown
            const submenu = document.getElementById(`${menuName}Submenu`);
            const isOpen = submenu.classList.contains('open');
            
            // Close all other dropdowns
            document.querySelectorAll('.submenu').forEach(sub => {
                sub.classList.remove('open');
            });
            
            document.querySelectorAll('.menu-item').forEach(mi => {
                mi.classList.remove('dropdown-open');
            });
            
            // Toggle current dropdown
            if (!isOpen) {
                submenu.classList.add('open');
                item.classList.add('dropdown-open');
            }
        } else {
            // Regular menu item clicked
            menuItems.forEach(mi => {
                mi.classList.remove('active');
                mi.classList.remove('dropdown-open');
            });
            
            submenuItems.forEach(si => {
                si.classList.remove('active');
            });
            
            document.querySelectorAll('.submenu').forEach(sub => {
                sub.classList.remove('open');
            });
            
            item.classList.add('active');
            
            // Close sidebar on mobile
            if (window.innerWidth < 1400) {
                sidebar.classList.remove('open');
                overlay.classList.remove('visible');
            }
        }
    });
});

// Submenu item functionality
submenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const parent = item.getAttribute('data-parent');
        
        // Remove active from all menu items
        menuItems.forEach(mi => {
            mi.classList.remove('active');
        });
        
        // Remove active from all submenu items
        submenuItems.forEach(si => {
            si.classList.remove('active');
        });
        
        // Set active on clicked submenu item
        item.classList.add('active');
        
        // Set active on parent menu item
        const parentMenuItem = document.querySelector(`[data-menu="${parent}"]`);
        if (parentMenuItem) {
            parentMenuItem.classList.add('active');
        }
        
        // Close sidebar on mobile
        if (window.innerWidth < 1400) {
            sidebar.classList.remove('open');
            overlay.classList.remove('visible');
        }
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1400) {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
    }
});
