package controllers;

import play.mvc.*;

/**
 * En avant les histoires...
 * @author sebastiencreme
 */
public class PlayMobile extends Controller{
    public static void emulator(){
        render("emulator.html");
    }
}
