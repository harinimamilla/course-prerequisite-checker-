from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# ==========================================
# DIRECTED GRAPH
# ==========================================

graph = {
    "Programming Fundamentals": [],
    "Data Structures": ["Programming Fundamentals"],
    "Algorithms": ["Data Structures"],
    "Database Management": ["Programming Fundamentals"],
    "Web Development": ["Programming Fundamentals"],
    "Operating Systems": ["Data Structures"],
    "Computer Networks": ["Operating Systems"],
    "Python Programming": [],
    "Statistics": [],
    "Machine Learning": ["Python Programming", "Statistics"]
}


# ==========================================
# DASHBOARD
# ==========================================

@app.route("/")
def dashboard():
    return render_template(
        "dashboard.html",
        courses=list(graph.keys()),
        graph=graph
    )


# ==========================================
# COURSE CHECKER
# ==========================================

@app.route("/checker")
def checker():
    return render_template(
        "checker.html",
        courses=list(graph.keys()),
        graph=graph
    )


# ==========================================
# COURSE EXPLORER
# ==========================================

@app.route("/courses")
def courses():
    return render_template(
        "courses.html",
        courses=list(graph.keys()),
        graph=graph
    )


# ==========================================
# DIRECTED GRAPH PAGE
# ==========================================

@app.route("/graph")
def graph_page():
    return render_template(
        "graph.html",
        courses=list(graph.keys()),
        graph=graph
    )


# ==========================================
# ABOUT PROJECT
# ==========================================

@app.route("/about")
def about():
    return render_template(
        "about.html",
        courses=list(graph.keys())
    )


# ==========================================
# CHECK PREREQUISITES
# ==========================================

def check_prerequisites(course, completed):

    missing = []

    for prerequisite in graph.get(course, []):

        if prerequisite not in completed:
            missing.append(prerequisite)

    return missing


# ==========================================
# CHECK API
# ==========================================

@app.route("/check", methods=["POST"])
def check():

    data = request.get_json()

    course = data.get("course")
    completed = data.get("completed", [])

    if course not in graph:

        return jsonify({
            "success": False,
            "message": "Course not found."
        })

    missing = check_prerequisites(
        course,
        completed
    )

    if not missing:

        return jsonify({
            "success": True,
            "eligible": True,
            "course": course,
            "missing": []
        })

    return jsonify({
        "success": True,
        "eligible": False,
        "course": course,
        "missing": missing
    })


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":
    app.run(debug=True)