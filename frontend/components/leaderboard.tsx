import LeaderboardCard from "./leaderboardCard";
import styles from "../styles/Home.module.css";

interface Props {
    data: any,
    handleGraphUpdate: any,
}

const Leaderboard: React.FC<Props> = ({ data, handleGraphUpdate }) => {

    return (<div style={{ width: "95%" }}>
        {
            data.map((value: { rank: string; fullName: string; username: string; }, index: any) => {
                return (
                    <div className={styles.leaderboardGrid}>
                        <LeaderboardCard key={value.rank} rank={value.rank} fullName={value.fullName} username={value.username} handleGraphUpdate={handleGraphUpdate}></LeaderboardCard>
                    </div>
                );
            })
        }
    </div>
    );
}

export default Leaderboard
