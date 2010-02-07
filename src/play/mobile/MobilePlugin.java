/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package play.mobile;

import java.lang.reflect.Method;
import play.Play;
import play.PlayPlugin;
import play.mvc.Http.Request;
import play.mvc.Router;

/**
 *
 * @author sebastiencreme
 */
public class MobilePlugin extends PlayPlugin{
    public static Boolean inEmulator = false;
    @Override
    public void onRoutesLoaded() {
        if (Play.mode == Play.Mode.DEV) Router.prependRoute("GET", "/@emulator", "PlayMobile.emulator");
    }

    @Override
    public void beforeActionInvocation(Method actionMethod) {
        super.beforeActionInvocation(actionMethod);
    }


}
