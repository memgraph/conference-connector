import LeaderboardCard from "./leaderboardCard";
import styles from "../styles/Home.module.css";

interface Props {
    data: any,
    handleGraphUpdate: any,
}

const Leaderboard: React.FC<Props> = ({ data, handleGraphUpdate }) => {
    let place = 0;
    return (<div style={{ width: "95%" }}>
        {
            data.map((value: { rank: string; fullName: string; username: string; }, index: any) => {
                place++;
                return (
                    <div key={place} className={styles.leaderboardGrid}>
                        <LeaderboardCard key={place} rank={String(place)} fullName={value.fullName} username={value.username} handleGraphUpdate={handleGraphUpdate}></LeaderboardCard>
                    </div>
                );
            })
        }
    </div>
    );
}

export default Leaderboard
