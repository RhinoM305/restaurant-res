import MobileNavigation from "./MobileNavigation";
import Navigation from "./Navigation";
import classes from "./NavBar.module.css";

function NavBar() {
  return (
    <div className={classes.NavBar} style={{}}>
      <Navigation />
      <MobileNavigation />
    </div>
  );
}

export default NavBar;
