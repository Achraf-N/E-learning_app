# Admin Components

## UserManagement.jsx

A comprehensive user management component for admins to handle CRUD operations on students and teachers.

### Features:

#### Student Management:

- **Semester Organization**: Students are organized by semesters (S1, S2, S3, S4)
- **Visual Layout**: Students are grouped by semester with clear visual separation
- **Filtering**: Filter students by semester or view all at once
- **Search**: Search students by name or email

#### Teacher Management:

- **List View**: Clean grid layout for teachers
- **Role-based Access**: Only admins can manage users
- **CRUD Operations**: Create, Read, Update, Delete teachers

#### General Features:

- **Add New Users**: Modal form to add students/teachers
- **Edit Users**: Update existing user information
- **Delete Users**: Remove users with confirmation
- **Search & Filter**: Real-time search across all users
- **Responsive Design**: Mobile-friendly layout
- **Success/Error Feedback**: Clear messages for all operations
- **Loading States**: Visual feedback during API operations

### User Roles:

- **Students**: Assigned to specific semesters (S1-S4)
- **Teachers**: General role without semester assignment
- **Admin Only**: This component is restricted to admin users

### API Integration:

Uses centralized API configuration from `src/config/api.js`:

- `API_CONFIG.ADMIN.USERS.LIST` - Get all users
- `API_CONFIG.AUTH.REGISTER` - Create new users
- `API_CONFIG.ADMIN.USERS.GET_BY_ID(id)` - Update user
- `API_CONFIG.ADMIN.USERS.DELETE(id)` - Delete user

### Navigation:

- Accessible via Admin Dashboard at `/admin/users`
- Requires admin role authentication
