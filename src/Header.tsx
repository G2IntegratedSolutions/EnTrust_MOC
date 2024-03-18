import banner from './assets/banner.png';
import arrow from './assets/arrow3.png';
import styles from './HomePage.module.css';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Header: React.FC = () => {
    const { isAuthenticated, logout, user } = useAuth();
    //const { isAuthenticated, logout, user } = {isAuthenticated:true, logout:()=>{}, user:{userName:"test", isAdmin:true, organization:"test"}};
    return (
        <header className={"header bg-light text-black py-3"}  >
        <div className="containerx" >
            <div className="row align-items-top">
                <div className="col text-left">
                    <img src={arrow} alt="arrow" className="img-fluid arrow" />
                    <img src={banner} alt="Header Logo" style={{marginLeft:'10px'}} className="img-fluid header-logo" />
                </div>
                <div className="col text-left" style={{zIndex:12}}>
                    <div className={`${styles.mocManager} ${styles.outlinedText} text-left`}>MoC MANAGER</div>
                    <div className={styles.manageYourChange + " text-left"}>Advancing Change</div>
                </div>
                <div style={{zIndex: 3, marginRight:'10px'}} className="col-auto ms-auto text-right">
                    <Link to="/login">
                        <div className={styles.login}>
                            {isAuthenticated ? (
                                <>
                                    {/* <div>Logged in as {user?.userName} {user?.isAdmin ? "ADMIN" : "USER"}</div> */}
                                    <div onClick={logout}>Logout</div>
                                    <div>{user?.isCreator ? "(creator)" : user?.isStakeholder ? "": user?.isApprover ? "(approver)": user?.isAdmin ? "(admin)": user?.isReviewer ? "(reviewer)": "??"}</div>
                                </>
                            ) : (
                                <div>Login</div>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    </header>
    )
}
export default Header;