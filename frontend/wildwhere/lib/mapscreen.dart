import 'dart:async';
import 'package:flutter/material.dart';
import 'package:wildwhere/data.dart';
import 'package:wildwhere/profile.dart';
import 'package:wildwhere/database.dart';
import 'package:wildwhere/report.dart';
import 'package:wildwhere/settings.dart';
import 'package:geolocator/geolocator.dart';
import 'package:mapbox_gl/mapbox_gl.dart';
import 'package:flutter/services.dart';
import 'package:wildwhere/postslistpage.dart';
import 'package:wildwhere/post.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapState();
}

class _MapState extends State<MapScreen> with TickerProviderStateMixin{
  MapboxMapController?
      _controller; // Controller to manage Mapbox map interaction.
  Symbol? selectedSymbol; // Holds the currently selected map symbol, if any.
  Offset?
      symbolWidgetPosition; // Stores the position of the pop-up info box relative to the map view.
  Map<String, dynamic> symbolDataMap =
      {}; // Maps each symbol's ID to its data for quick retrieval.
  Map<String, dynamic>?
      currentPostData; // Data for the currently selected symbol.
  Future<Position>? position;

  late AnimationController reportanimationController;
  late Animation<double> reportopacityAnimation;
  late AnimationController infoBoxAnimationController;
  late Animation<double> infoBoxOpacityAnimation;
  late Animation<Offset> infoBoxPositionAnimation;
  
  var reportOverlayControl = OverlayPortalController();

  @override
  void initState() {
    super.initState();
    
    reportanimationController = AnimationController(
        duration: const Duration(milliseconds: 150),
        vsync: this,
      );
    reportopacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(parent: reportanimationController, curve: Curves.easeIn)
      );
    
    infoBoxAnimationController = AnimationController(
      duration: const Duration(milliseconds: 220),
      reverseDuration: const Duration(milliseconds: 160),
      vsync: this,
    );

    infoBoxOpacityAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: infoBoxAnimationController,
      curve: Curves.easeOut,
      reverseCurve: Curves.easeInCubic,
    ));

    infoBoxPositionAnimation = Tween<Offset>(
      begin: const Offset(0, 0.12),  // Start slightly below the final position
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: infoBoxAnimationController,
      curve: Curves.fastEaseInToSlowEaseOut,
      reverseCurve: Curves.easeInCubic,
    ));
    
  }

  @override
  void dispose() {
    _controller
        ?.dispose(); // Clean up the controller when the widget is removed from the widget tree.
    reportanimationController.dispose();
    infoBoxAnimationController.dispose();
    super.dispose();
  }

  void _onMapCreated(MapboxMapController controller) {
    // Callback function when the map is created and ready.
    _controller = controller;
    controller.onSymbolTapped.add(_onSymbolTapped);
    controller.addListener(_onCameraMove);
    addImageFromAsset("assetImage", "assets/images/markericon.png");
  }

  void _onStyleLoaded() async {
    // Called when map style is fully loaded; we typically use this to add markers dynamically.
    _loadMarkers();
  }

  Future<void> addImageFromAsset(String name, String assetName) async {
    // Helper function to add a custom image asset to be used as a map marker icon.
    final ByteData bytes = await rootBundle.load(assetName);
    final Uint8List list = bytes.buffer.asUint8List();
    await _controller?.addImage(name, list);
  }

  void _loadMarkers() async {
    // Load markers from a data source and add them to the map.
    try {
      List<Post> posts = await Database().getAllPosts();
      for (Post post in posts) {
        _addMarker(post.pid!, post.coordinate['y'] as double,
            post.coordinate['x'] as double,
            post: post);
      }
    } catch (e) {
      print("Failed to load posts: $e");
    }
  }

  void _addMarker(String id, double latitude, double longitude, {Post? post}) {
    // Adds a single marker to the map.
    _controller
        ?.addSymbol(
      SymbolOptions(
        geometry: LatLng(latitude, longitude),
        iconImage: "assetImage",
        iconSize: 1.05,
      ),
    )
        .then((symbol) {
      // Storing post data in the map
      if (post != null) {
        symbolDataMap[symbol.id] = post.toJson();
      }
    });
  }

  void refreshMarkers() async {
    await _controller?.clearSymbols(); // Clear all existing markers
    _loadMarkers(); // Reload markers from database
  }

  void _onSymbolTapped(Symbol symbol) async {
      if (selectedSymbol != null && selectedSymbol!.id == symbol.id) {
        // If the same symbol is tapped again, reverse the animation to hide the info box.
        await infoBoxAnimationController.reverse();
        setState(() {
            selectedSymbol = null;
            currentPostData = null;
        });
    } else {
        setState(() {
            selectedSymbol = symbol;
            currentPostData = symbolDataMap[symbol.id];
            _updateSymbolPosition();
        });
        infoBoxAnimationController.forward(from: 0.0);  // Start the animation from the beginning
    }
  }

  void _onCameraMove() {
    // Refresh symbol position on camera (map view) move.
    if (_controller != null && selectedSymbol != null) {
      _updateSymbolPosition();
    }
  }

  void _updateSymbolPosition() async {
    // Update the position of the information box relative to the selected symbol.
    if (selectedSymbol == null || _controller == null) return;
    var screenLocation =
        await _controller!.toScreenLocation(selectedSymbol!.options.geometry!);
    setState(() {
      symbolWidgetPosition =
          Offset(screenLocation.x - 100, screenLocation.y - 125);
    });
  }

  @override
  Widget build(BuildContext context) {
    //var reportOverlayControl = OverlayPortalController();
    //var prefOverlayControl = OverlayPortalController();
    return Stack(children: <Widget>[
      Scaffold(
        body: Stack(
          children: [
            MapboxMap(
              styleString: Theme.of(context).brightness == Brightness.dark
                ? "mapbox://styles/mapbox/dark-v11"
                :  "mapbox://styles/mberezuns/clv1ba4fz019m01p61mdggons",
              accessToken:
                  "pk.eyJ1IjoibWJlcmV6dW5zIiwiYSI6ImNsdjA1MTk0djFlcDIybG14bHNtem1xeGEifQ.Xcg2SVacZ2TjY0zcKVKTig",
              myLocationEnabled: true,
              attributionButtonPosition: AttributionButtonPosition.BottomLeft,
              compassEnabled: false,
              tiltGesturesEnabled: false,
              myLocationRenderMode: MyLocationRenderMode.NORMAL,
              onMapCreated: _onMapCreated,
              onStyleLoadedCallback: _onStyleLoaded,
              trackCameraPosition: true,
              initialCameraPosition: const CameraPosition(
                target: LatLng(42.381030, -72.529010),
                zoom: 12,
              ),
              onMapClick: (point, latLng) async{
                if(selectedSymbol != null){
                  await infoBoxAnimationController.reverse();
                  setState(() {
                    selectedSymbol = null;
                    symbolWidgetPosition = null;
                  });
                }
              },
            ),
            if (symbolWidgetPosition != null)
              Positioned(
                left: symbolWidgetPosition!.dx - 25,
                top: symbolWidgetPosition!.dy - 25,
                child: _buildInfoBox(),
              ),
            Positioned(
              right: 10,
              top: 67,
              child: SizedBox(
                height: 65,
                width: 65,
                child: PopupMenuButton<int>(
                  elevation: 10,
                  offset: const Offset(-5, 63),
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.all(Radius.circular(15)),
                  ),
                  popUpAnimationStyle: AnimationStyle(
                    curve: Curves.easeInOut,
                    duration: const Duration( milliseconds: 330)
                    ),
                  onSelected: (item) => onSelected(context, item),
                  child: ClipOval(
                    child: Image.asset(
                      'assets/images/profile.png',
                      width: 50,
                      height: 50,
                      fit: BoxFit.cover,
                    ),
                  ),
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 0, 
                      child: ListTile(
                        horizontalTitleGap: 12.0,
                        leading: Icon(Icons.person, size: 28),
                        title: Text('Profile',style: TextStyle(fontSize: 14)),
                      )
                    ),
                    const PopupMenuItem(
                      value: 1, 
                      child: ListTile(
                        horizontalTitleGap: 12.0,
                        leading: Icon(Icons.settings, size: 28),
                        title: Text('Settings',style: TextStyle(fontSize: 14)),
                      )
                    ),
                    const PopupMenuItem(
                      value: 2, 
                      child: ListTile(
                        horizontalTitleGap: 12.0,
                        leading: Icon(Icons.insert_chart_outlined_rounded, size: 28),
                        title: Text('Data and Stats', style: TextStyle(fontSize: 14)),
                      )
                    ),
                  ],
                ),
              ),
            )
          ],
        ),
        floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
        floatingActionButton: FloatingActionButton.large(
          onPressed: () {
            setState(() {
              reportOverlayControl.toggle();
              reportanimationController.reset();
              reportanimationController.forward();
            });
          },
          elevation: 10,
          shape: const CircleBorder(),
          child: OverlayPortal(
            controller: reportOverlayControl,
            overlayChildBuilder: (BuildContext context) {
              return FadeTransition(
              opacity: reportopacityAnimation,
              child: ReportPage(
                  onPostCreated: () async{
                    refreshMarkers();
                    await reportanimationController.reverse();
                    reportOverlayControl.toggle();
                  },
                  controller: reportOverlayControl
                )
              );
            },
          child: const Icon(Icons.add_location_alt_outlined),
        ),
      ),
    ),
      Positioned(
        bottom: 30,
        right: 20,
        child: Column(
          children: <Widget>[
            FloatingActionButton(
              onPressed: () => currentLocation(_controller),
              shape: const CircleBorder(),
              elevation: 10,
              child: const Icon(Icons.my_location),
            ),
            const SizedBox(height: 10),
            FloatingActionButton(
              onPressed: _navigateToPostsPage,
              shape: const CircleBorder(),
              elevation: 10,
              child: const Icon(Icons.list),
            )
            /*FloatingActionButton(
              onPressed: prefOverlayControl.toggle,
              shape: const CircleBorder(),
              elevation: 2,
              backgroundColor: const Color.fromARGB(255, 255, 255, 255),
              child: OverlayPortal(
                controller: prefOverlayControl,
                overlayChildBuilder: (BuildContext context) {
                  return const MapPreferences();
                },
                child: const Icon(Icons.layers_outlined),
              ),
            ),
            */
          ],
        ),
      ),
    ]);
  }

  void _navigateToPostsPage() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const PostsListPage()),
    );
    refreshMarkers();
  }
  Widget _buildInfoBox() {
    // Generates informational box widget for currently selected marker.
    if (selectedSymbol == null || currentPostData == null) {
      return const SizedBox
          .shrink(); // Return an empty container if no symbol is selected
    }

    Map<String, dynamic> data = currentPostData!;
    /*String infoText = "PID: ${data['pid']}\n"
        "Animal: ${data['animalName']}\n"
        "Activity: ${data['activity']}\n"
        "Quantity: ${data['quantity']}\n";*/

    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;

    return AnimatedBuilder(
      animation: infoBoxAnimationController, 
      builder: (context, child){
        if (infoBoxAnimationController.isDismissed) {
                return SizedBox.shrink();  // This ensures that widget collapses when the animation is dismissed
            }
          return SlideTransition(
          position: infoBoxPositionAnimation,
          child: FadeTransition(
            opacity: infoBoxOpacityAnimation,
                child: Container(
              width: screenWidth * 0.7,
              height: screenHeight * 0.155,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black26, 
                      offset: Offset(0, 3),
                      blurRadius: 3.0,
                      spreadRadius: 0.1,
                    )
                  ]),
              child: Row(
                children: [
                  // Image Container
                  Expanded(
                    flex: 1, // takes 1/2 of the space
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10.0),
                      child: Image.network(
                          data['imgLink'] ??
                              'https://via.placeholder.com/150', // Placeholder if no imgLink is available
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                        // Fallback for when the image fails to load
                        return const Icon(Icons.image_not_supported);
                      }),
                    ),
                  ),

                  // Text Container
                  Expanded(
                    flex: 1, // takes 1/2 of the space
                    child: Container(
                      padding: const EdgeInsets.only(left: 10),
                      alignment: Alignment.topLeft,
                      child: RichText(
                        text:  TextSpan(
                          style: const TextStyle(
                            color: Colors.black,
                            fontSize: 13,
                            overflow: TextOverflow.ellipsis,
                            fontFamily: 'CupertinoSystemText',
                            letterSpacing: -0.45,
                            height: 1.3,
                          ),
                          children: <TextSpan>[
                            const TextSpan(text: 'PID: ', style: TextStyle(fontWeight: FontWeight.bold)),
                            TextSpan(text: "${data['pid']}\n"),
                            const TextSpan(text: 'Animal: ', style: TextStyle(fontWeight: FontWeight.bold)),
                            TextSpan(text: "${data['animalName']}\n"),
                            const TextSpan(text: 'Activity: ', style: TextStyle(fontWeight: FontWeight.bold)),
                            TextSpan(text: "${data['activity']}\n"),
                            const TextSpan(text: 'Quantity: ', style: TextStyle(fontWeight: FontWeight.bold)),
                            TextSpan(text: "${data['quantity']}\n"),
                          ]
                        ),
                      ),
                    ),
                  )
                ],
              ),
            )
          ),
        );
      }
    );
  }
}

//Handles drop-down selection navigation
void onSelected(BuildContext context, int item) {
  switch (item) {
    case 0:
      Navigator.push(
          context, MaterialPageRoute(builder: (context) => const Profile()));
      break;

    case 1:
      Navigator.push(context,
          MaterialPageRoute(builder: (context) => const SettingsPage()));
      break;

    case 2:
      Navigator.push(
          context, MaterialPageRoute(builder: (context) => const Data()));
      break;
  }
}

void currentLocation(var controller) async {
  bool serviceEnabled;
  LocationPermission permission;
  serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled) {
    throw Exception('Location service are disabled!');
  }
  permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied) {
      throw Exception('Location permissions are denied!');
    }
  }
  if (permission == LocationPermission.deniedForever) {
    throw Exception(
        'Location permissions are permanently denied, we cannot request permissions.');
  }
  Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high);
  controller.animateCamera(
    CameraUpdate.newCameraPosition(
      CameraPosition(
        bearing: 0,
        target: LatLng(position.latitude, position.longitude),
        zoom: 17.0,
      ),
    ),
  );
}
