const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// JSON File Path
const filePath = path.join(__dirname, "employees.json");

// Read Employees
function getEmployees() {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
    }
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

// Save Employees
function saveEmployees(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// HOME PAGE

app.get("/", (req, res) => {
    const employees = getEmployees();
    const search = req.query.search;

    if (search && search.trim() !== "") {
        const filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(search.toLowerCase()) ||
            emp.department.toLowerCase().includes(search.toLowerCase()) ||
            emp.gender.toLowerCase().includes(search.toLowerCase())
        );

        return res.render("index", { employees: filtered });
    }

    res.render("index", { employees });
});
// ADD PAGE
app.get("/add", (req, res) => {
    res.render("add");
});

app.post("/add", (req, res) => {
    const employees = getEmployees();

    const newEmployee = {
        id: Date.now().toString(),
        name: req.body.name,
        gender: req.body.gender,
        department: req.body.department,
        salary: Number(req.body.salary),
        startDate: req.body.startDate
    };

    employees.push(newEmployee);
    saveEmployees(employees);

    res.redirect("/");
});
// EDIT PAGE
app.get("/edit/:id", (req, res) => {
    const employees = getEmployees();

    const employee = employees.find(emp => emp.id == req.params.id);

    if (!employee) {
        return res.send("Employee not found");
    }

    res.render("edit", { employee: employee });  // 👈 IMPORTANT
});

// UPDATE EMPLOYEE

app.post("/edit/:id", (req, res) => {
    const employees = getEmployees();
    const index = employees.findIndex(emp => emp.id == req.params.id);

    if (index !== -1) {
        employees[index].name = req.body.Name;
        employees[index].gender = req.body.Gender;
        employees[index].department = req.body.department;
        employees[index].salary = Number(req.body.Salary);
        employees[index].startDate = req.body.startDate;

        saveEmployees(employees);
    }

    res.redirect("/");
});

// DELETE EMPLOYEE

app.get("/delete/:id", (req, res) => {
    let employees = getEmployees();

    employees = employees.filter(emp => emp.id !== req.params.id);

    saveEmployees(employees);

    res.redirect("/");
});

// DASHBOARD DATA

app.get("/dashboard-data", (req, res) => {
    const employees = getEmployees();

    const totalEmployees = employees.length;
    const departments = new Set(employees.map(e => e.department)).size;

    const totalBasicSalary = employees.reduce((sum, e) => sum + e.salary, 0);
    const totalTax = totalBasicSalary * 0.12;
    const totalNetSalary = totalBasicSalary - totalTax;
    const avgSalary = totalEmployees > 0 ? totalBasicSalary / totalEmployees : 0;

    res.json({
        totalEmployees,
        departments,
        totalBasicSalary,
        totalTax,
        totalNetSalary,
        avgSalary
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
