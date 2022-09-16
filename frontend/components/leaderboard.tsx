import LeaderboardCard from "./leaderboardCard";
import styles from "../styles/Home.module.css";

interface Props {
    data: any,
    handleGraphUpdate: any,
}

const Leaderboard: React.FC<Props> = ({ data, handleGraphUpdate }) => {
    return (<div style={{ width: "95%" }}>
        {
            data.map((value: { position: string; fullName: string; username: string; }, index: any) => {
                return (
                    <div key={index} className={styles.leaderboardGrid}>
                        <LeaderboardCard key={index} position={value.position} fullName={value.fullName} username={value.username} handleGraphUpdate={handleGraphUpdate}></LeaderboardCard>
                    </div>
                );
            })
        }
    </div>
    );
}

export default Leaderboard
