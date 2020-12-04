const router = require("express").Router();
const base = require("airtable").base("appOCNJ0BSbzHwTF3");

const TEAM_LIMIT = 5;
const INDIV_LIMIT = 5;

router.post("/add-team", async (req, res) => {
  const { name, student1, student2, student3, student4 } = req.body;

  if (!req.user || !req.user.fields.Email || !req.user.fields.Phone) {
    return res.status(400).send({
      error: "Coach email and phone number must be set before creating teams."
    });
  }

  if (!name || !student1) {
    return res.status(400).send({ error: "Missing team name or student 1." });
  }
  const sameName = await base("Competitors")
    .select({
      filterByFormula: `{Name} = '${name}'`
    })
    .firstPage();

  if (sameName.length > 0) {
    return res.status(400).send({ error: "Team name already in use." });
  }

  const coachTeams = await base("Competitors")
    .select({
      filterByFormula: `{Coach} = '${req.user.id}'`
    })
    .firstPage();

  if (coachTeams.length == TEAM_LIMIT) {
    return res.status(400).send({ error: "Team limit reached." });
  }

  try {
    const newTeam = await base("Competitors").create([
      {
        fields: {
          Name: name,
          "Student 1": student1,
          "Student 2": student2,
          "Student 3": student3,
          "Student 4": student4,
          Coach: [req.user.id]
        }
      }
    ]);
    return res.send({
      amountPaid: 0,
      amountOwed: 0
    });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ error: "Error creating team." });
  }
});

module.exports = router;