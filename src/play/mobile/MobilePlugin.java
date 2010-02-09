/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package play.mobile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.lang.reflect.Method;
import play.Play;
import play.PlayPlugin;
import play.libs.Files;
import play.mvc.Http.Request;
import play.mvc.Http.Response;
import play.mvc.Router;
import play.mvc.results.NotFound;
import play.vfs.VirtualFile;

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
