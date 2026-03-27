import { useState } from "react";

export default function Survey() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    hazard: "",
    severity: "",
    description: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form); // later send to backend
    alert("Report submitted!");
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Report Hazard</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>

        <input name="name" placeholder="Name" onChange={handleChange} /><br/><br/>
        <input name="email" placeholder="Email" onChange={handleChange} /><br/><br/>
        <input name="location" placeholder="Location" onChange={handleChange} /><br/><br/>

        <select name="hazard" onChange={handleChange}>
          <option>Flood</option>
          <option>Pollution</option>
          <option>Landslide</option>
        </select><br/><br/>

        <select name="severity" onChange={handleChange}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select><br/><br/>

        <textarea name="description" placeholder="Describe issue" onChange={handleChange} /><br/><br/>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}