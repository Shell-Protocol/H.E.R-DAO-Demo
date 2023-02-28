import Navbar from "../components/Navbar";
import Main from "../components/Main";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />
      <Main />
    </div>
  );
}
