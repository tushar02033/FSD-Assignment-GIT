import { useState } from "react";
import Avatar from "./Avatar";

/*
  ProfileCard — props:
    name, image (URL), description  → required by the assignment
    title, role, location, skills, followers, hue, github, linkedin → optional extras
*/
function ProfileCard({ name, image, description, title, role, location, skills = [], followers = 0, hue = 220, github, linkedin }) {
  const [following, setFollowing] = useState(false);
  const count = followers + (following ? 1 : 0);

  return (
    <article className="card" style={{ "--hue": hue }}>
      <div className="banner" />
      <div className="card-body">
        <Avatar name={name} image={image} hue={hue} />
        {role && <span className="role-pill">{role}</span>}
        <h2>{name}</h2>
        {title && <p className="title">{title}{location && ` · ${location}`}</p>}
        <p className="bio">{description}</p>

        {skills.length > 0 && (
          <ul className="skills">
            {skills.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
        )}

        <div className="stats"><strong>{count.toLocaleString("en-IN")}</strong> followers</div>

        <div className="actions">
          <button className={`follow ${following ? "on" : ""}`} onClick={() => setFollowing(!following)}>
            {following ? "✓ Following" : "Follow"}
          </button>
          {github && <a href={github} target="_blank" rel="noreferrer">GitHub</a>}
          {linkedin && <a href={linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
        </div>
      </div>
    </article>
  );
}

export default ProfileCard;
