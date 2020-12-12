const router = require("express").Router();
const base = require("airtable").base("appOCNJ0BSbzHwTF3");
const updateUser = require("../middleware/updateUser");
const { minTeamMembersPerTeam, maxTeamsPerCoach } = require("../config");

router.post(
  "/update-coach-info",
  async (req, res, next) => {
    if (!req.user)
      return res.status(400).send("Not authenticated. Please login again.");
    const { name, phone, email, mail } = req.body;
    if (!name || !phone || !email || !mail) {
      return res.status(400).send("Missing coach information");
    }

    try {
      await base("Coaches").update([
        {
          id: req.user.id,
          fields: {
            Email: email,
            Name: name,
            Address: mail,
            Phone: phone
          }
        }
      ]);
    } catch (err) {
      return res.status(400).send("Unkown error updating coach info.");
    }
    next();
  },
  updateUser
);

router.post("/add-team", async (req, res) => {
  const { name, student1, student2, student3, student4 } = req.body;

  if (!req.user || !req.user.fields.Email || !req.user.fields.Phone) {
    return res.status(400).send({
      error: "Coach email and phone number must be set before creating teams."
    });
  }

  if (!name) {
    return res.status(400).send({ error: "Missing team name." });
  }
  let i = 0;
  for (const student of [student1, student2, student3, student4]) {
    if (i >= minTeamMembersPerTeam) break;
    if (!student)
      return res.status(400).send({
        error:
          "Team member count below minimum allowed (" +
          minTeamMembersPerTeam +
          ")."
      });
    i++;
  }

  const coach = (
    await base("Coaches")
      .select({
        filterByFormula: `{ID} = '${req.user.id}'`
      })
      .firstPage()
  )[0];

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
      filterByFormula: `AND({Coach} = '${req.user.id}', NOT({Individual}))'`
    })
    .firstPage();

  let teamLimit =
    coach.fields["Team Limit"] < 0
      ? maxTeamsPerCoach
      : coach.fields["Team Limit"];
  if (coachTeams.length == teamLimit) {
    return res.status(400).send({ error: "Team limit reached." });
  }

  try {
    const team = await base("Competitors").find(id);
    if (team.fields.Coach[0] !== req.user.id)
      return res.status(400).send("Coach does not have access to this team.");

    await base("Competitors").update([
      {
        id,
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
    return res.status(400).send({ error: "Error updating team." });
  }
});

router.post("/add-indiv", async (req, res) => {
  const { student } = req.body;

  if (!req.user || !req.user.fields.Email || !req.user.fields.Phone) {
    return res.status(400).send({
      error: "Coach email and phone number must be set before creating teams."
    });
  }

  if (!student) {
    return res.status(400).send({ error: "Missing student name." });
  }

  const coach = (
    await base("Coaches")
      .select({
        filterByFormula: `{ID} = '${req.user.id}'`
      })
      .firstPage()
  )[0];

  const coachIndivs = await base("Competitors")
    .select({
      filterByFormula: `AND({Coach} = '${req.user.id}', {Individual})`
    })
    .firstPage();

  if (coachIndivs.filter((s) => s.fields["Student 1"] === student).length > 0) {
    return res.status(400).send({ error: "Duplicate student." });
  }

  let indivLimit =
    coach.fields["Individual Limit"] < 0
      ? maxTeamsPerCoach
      : coach.fields["Individual Limit"];
  if (coachIndivs.length == indivLimit) {
    return res.status(400).send({ error: "Team limit reached." });
  }

  try {
    const newIndividual = await base("Competitors").create([
      {
        fields: {
          "Student 1": student,
          Coach: [req.user.id],
          Individual: true
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
