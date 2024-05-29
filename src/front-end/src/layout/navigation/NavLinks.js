import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { RiHome5Line } from "react-icons/ri";
import { MdOutlineTableBar } from "react-icons/md";

import classes from "./NavBar.module.css";
import React from "react";

const NavLinks = () => {
  return (
    <ul className="nav navbar-nav text-light" id="accordionSidebar">
      <li className="nav-item">
        <Link
          className="nav-link display"
          style={{ display: "flex", justifyContent: "center" }}
          to="/dashboard"
        >
          <RiHome5Line className={classes.menu_icons}/>
          <div className={classes.menu_text}>&nbsp;Dashboard</div>
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className="nav-link"
          style={{ display: "flex", justifyContent: "center" }}
          to="/search"
        >
          <FiSearch className={classes.menu_icons} />
          <div className={classes.menu_text}>&nbsp;Search</div>
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className="nav-link"
          style={{ display: "flex", justifyContent: "center" }}
          to="/reservations/new"
        >
          <AiOutlinePlusCircle className={classes.menu_icons} />
          <div className={classes.menu_text}>&nbsp;New Reservation</div>
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className="nav-link"
          style={{ display: "flex", justifyContent: "center" }}
          to="/tables/new"
        >
          <MdOutlineTableBar className={classes.menu_icons} />

          <div className={classes.menu_text}>&nbsp;New Table</div>
        </Link>
      </li>
    </ul>
  );
};

export default NavLinks;
